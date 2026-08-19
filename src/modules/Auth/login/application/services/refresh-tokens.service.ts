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

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly loggerAdapter: LoggerAdapter,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
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
      // Reapresentação de um refresh token já rotacionado: sinal de roubo de
      // token. Revoga toda a família (todas as sessões do usuário) em vez de
      // só rejeitar essa requisição.
      await this.revokeFamilyAndThrow(userId);
    }

    // `revokeRefreshTokenById` só revoga se o token ainda estiver
    // `isRevoked = false` no banco (compare-and-swap). Se devolver `false`,
    // outra requisição concorrente com o mesmo token venceu a corrida entre
    // a leitura acima e este `UPDATE` — trata como reuso pelo mesmo motivo.
    const revoked = await this.refreshTokenRepository.revokeRefreshTokenById(
      matchedRefreshToken.id,
    );

    if (!revoked) {
      await this.revokeFamilyAndThrow(userId);
    }

    return this.generateNewTokens({
      accountId: user.id,
      userRole: user.role,
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

    await this.refreshTokenRepository.createRefreshToken(newRefreshToken);

    return { accessToken, refreshToken };
  }
}

interface TokenParams {
  accountId: string;
  userRole: Role;
}
