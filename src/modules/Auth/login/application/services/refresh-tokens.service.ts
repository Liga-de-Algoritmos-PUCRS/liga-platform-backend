import { Injectable } from '@nestjs/common';
import { TokensResponseInterface } from '@/modules/Auth/login/application/dtos/refreshToken';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { GenerateTokensService } from '@/modules/Auth/login/application/services/generate-tokens.service';
import { TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';

// Janela em que um token já rotacionado ainda é aceito: cobre abas/requisições
// concorrentes que dispararam o refresh com o mesmo cookie antes de receberem
// o novo.
const REFRESH_REUSE_GRACE_MS = 60_000;

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly generateTokensService: GenerateTokensService,
  ) {}

  async execute(
    userId: string,
    jti: string | undefined,
    oldRefreshToken: string,
  ): Promise<TokensResponseInterface> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      // 401 em vez de 404: não vaza se a conta existe
      throw this.exceptionsAdapter.unauthorized({
        message: 'Invalid refresh token',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (!jti) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'Invalid refresh token',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    const userRefreshToken = await this.refreshTokenRepository.findRefreshTokenById(jti);
    if (
      !userRefreshToken ||
      userRefreshToken.accountId !== userId ||
      userRefreshToken.expiresAt.getTime() <= Date.now()
    ) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'Invalid refresh token',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    const verifyToken = await this.cryptographyAdapter.compare({
      plainText: oldRefreshToken,
      cryptographedText: userRefreshToken.token,
    });

    if (!verifyToken) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'Invalid refresh token',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (userRefreshToken.isRevoked) {
      const withinGrace =
        userRefreshToken.revokedAt &&
        Date.now() - userRefreshToken.revokedAt.getTime() < REFRESH_REUSE_GRACE_MS;

      if (!withinGrace) {
        throw this.exceptionsAdapter.unauthorized({
          message: 'Invalid refresh token',
          internalKey: TokenExceptions.TOKEN_INVALID,
        });
      }
    } else {
      await this.refreshTokenRepository.revokeRefreshTokenById(userRefreshToken.id);
    }

    return this.generateTokensService.execute({
      accountId: user.id,
      userRole: user.role,
    });
  }
}
