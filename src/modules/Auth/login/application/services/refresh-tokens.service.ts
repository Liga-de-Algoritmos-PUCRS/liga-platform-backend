import { Injectable } from '@nestjs/common';
import { TokensResponseInterface } from '@/modules/Auth/login/application/dtos/refreshToken';
import { RefreshToken } from '@/modules/Auth/login/domain/refresh-token.entity';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import * as ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/global/env.schema';
import { UserExceptions, TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { Role } from '@/modules/User/domain/user.entity';
import { digestRefreshToken } from '@/modules/Auth/login/application/refresh-token-digest';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';

/**
 * Sentinela interna: sinaliza que o CAS de revogação do token antigo perdeu
 * a corrida, para abortar (rollback) a transação que já inseriu o token novo
 * — sem essa transação, a linha nova ficaria órfã no banco quando a
 * requisição perde a corrida.
 */
class RefreshTokenRaceLostError extends Error {}

/**
 * Janela de tolerância para recuperar uma sessão a partir do pai imediato de
 * uma rotação já concluída (back#62): cobre o cliente que perdeu a resposta
 * de um /auth/refresh bem-sucedido (conexão caiu no meio do round-trip) e
 * reapresenta o token velho pouco depois. Fora da janela, a reapresentação
 * volta a cair no 401 tolerado (sem revogar família) de back#51.
 */
const IMMEDIATE_PARENT_RECOVERY_GRACE_MS = 2 * 60 * 1000;

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly loggerAdapter: LoggerAdapter,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly transactionAdapter: TransactionAdapter,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async execute(userId: string, oldRefreshToken: string): Promise<TokensResponseInterface> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw this.exceptionsAdapter.notFound({
        message: 'User not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    // Inclui tokens já revogados (não expirados) para poder distinguir "token
    // nunca existiu" de "token já foi rotacionado e está sendo reapresentado".
    const candidates =
      await this.refreshTokenRepository.findNonExpiredRefreshTokensByAccountId(userId);

    const digest = digestRefreshToken(oldRefreshToken);
    let matchedRefreshToken: RefreshToken | null = null;
    for (const candidate of candidates) {
      const isMatch = await this.cryptographyAdapter.compare({
        plainText: digest,
        cryptographedText: candidate.token,
      });

      if (isMatch) {
        matchedRefreshToken = candidate;
        break;
      }
    }

    if (!matchedRefreshToken) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'No valid refresh token found for user',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (matchedRefreshToken.isRevoked) {
      // Reapresentação de um refresh token já rotacionado. Se o vínculo de
      // rotação aponta para a sessão viva atual (uma geração de distância),
      // é uma requisição atrasada de uma corrida benigna entre abas — não
      // roubo de token — e não deve derrubar a família inteira.
      const child = matchedRefreshToken.replacedByTokenId
        ? candidates.find((candidate) => candidate.id === matchedRefreshToken.replacedByTokenId)
        : null;

      if (!child || child.isRevoked) {
        await this.revokeFamilyAndThrow(userId);
      } else {
        const withinRecoveryGrace =
          Date.now() - child.createdAt.getTime() <= IMMEDIATE_PARENT_RECOVERY_GRACE_MS;

        if (withinRecoveryGrace) {
          this.loggerAdapter.debug({
            where: 'RefreshTokenService.execute',
            message: `Refresh token rotation recovered for user ${userId} (immediate parent reused within recovery grace window)`,
          });

          // repointOrphanId reaponta matchedRefreshToken (o órfão) para o
          // token vivo que sai desta recuperação. Sem isso, uma segunda
          // reapresentação do mesmo órfão (ex.: retry de rede duplicado —
          // plausível justo no cenário de conexão instável desta issue)
          // encontraria `child` já revogado por esta própria recuperação,
          // seria lida como reuso de 2+ gerações e derrubaria a família
          // inteira, inclusive o token que acabamos de emitir.
          return this.generateNewTokens({
            accountId: user.id,
            userRole: user.role,
            oldRefreshTokenId: child.id,
            repointOrphanId: matchedRefreshToken.id,
          });
        }

        this.loggerAdapter.debug({
          where: 'RefreshTokenService.execute',
          message: `Refresh token rotation race tolerated for user ${userId} (immediate parent reused, outside recovery grace window)`,
        });
      }

      throw this.exceptionsAdapter.unauthorized({
        message: 'Refresh token already used',
        internalKey: TokenExceptions.TOKEN_REUSED,
      });
    }

    return this.generateNewTokens({
      accountId: user.id,
      userRole: user.role,
      oldRefreshTokenId: matchedRefreshToken.id,
    });
  }

  private async revokeFamilyAndThrow(userId: string): Promise<never> {
    this.loggerAdapter.warn({
      where: 'RefreshTokenService.execute',
      message: `Refresh token reuse detected for user ${userId}; revoking all sessions`,
    });

    await this.refreshTokenRepository.revokeAllRefreshTokensByAccountId(userId);

    throw this.exceptionsAdapter.unauthorized({
      message: 'Refresh token already used',
      internalKey: TokenExceptions.TOKEN_REUSED,
    });
  }

  private async generateNewTokens(tokenParams: TokenParams): Promise<TokensResponseInterface> {
    const payload = {
      sub: tokenParams.accountId,
      userRole: tokenParams.userRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION') as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') as StringValue,
      }),
    ]);

    const hashedToken = await this.cryptographyAdapter.hash({
      plainText: digestRefreshToken(refreshToken),
      hashSalt: 8,
    });

    const expireInString = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION');
    const expireInMs = ms(expireInString as StringValue);
    const expiresAt = new Date(Date.now() + expireInMs);

    const newRefreshToken = new RefreshToken({
      token: hashedToken,
      accountId: tokenParams.accountId,
      expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    });

    try {
      // Uma transação só: cria o token novo e, no mesmo fôlego, tenta o CAS
      // de revogação do token antigo (`WHERE isRevoked = false`) gravando
      // `replacedByTokenId` nesse UPDATE. A FK exige que o token novo já
      // exista para ser referenciado — por isso o `create` vem primeiro —
      // mas se o CAS devolver `false` (outra requisição concorrente com o
      // mesmo token venceu a corrida entre a leitura e este UPDATE), o
      // rollback da transação desfaz também o `create`, sem deixar linha
      // órfã. Essa corrida não é reuso de um token já rotacionado — é a
      // corrida legítima entre abas que o front já tolera (front/CLAUDE.md)
      // — então só rejeita esta requisição, sem revogar a sessão que a
      // outra aba acabou de conseguir.
      await this.transactionAdapter.transaction(async (tx) => {
        await this.refreshTokenRepository.createRefreshToken(newRefreshToken, tx);

        const revoked = await this.refreshTokenRepository.revokeRefreshTokenById(
          tokenParams.oldRefreshTokenId,
          newRefreshToken.id,
          tx,
        );

        if (!revoked) {
          throw new RefreshTokenRaceLostError();
        }

        if (tokenParams.repointOrphanId) {
          await this.refreshTokenRepository.repointOrphanToLiveDescendant(
            tokenParams.repointOrphanId,
            newRefreshToken.id,
            tx,
          );
        }
      });
    } catch (error) {
      if (error instanceof RefreshTokenRaceLostError) {
        throw this.exceptionsAdapter.unauthorized({
          message: 'Refresh token already used',
          internalKey: TokenExceptions.TOKEN_REUSED,
        });
      }

      throw error;
    }

    return { accessToken, refreshToken };
  }
}

interface TokenParams {
  accountId: string;
  userRole: Role;
  oldRefreshTokenId: string;
  repointOrphanId?: string;
}
