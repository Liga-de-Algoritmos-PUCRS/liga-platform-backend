import { Injectable } from '@nestjs/common';
import { TokensResponseInterface } from '@/modules/Auth/login/application/dtos/refreshToken';
import { RefreshToken } from '@/modules/Auth/login/domain/refresh-token.entity';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import * as ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/global/env.schema';
import { UserExceptions, TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { Role } from '@/modules/User/domain/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
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

    const userRefreshTokens =
      await this.refreshTokenRepository.findValidRefreshTokensByAccountId(userId);

    let matchedRefreshToken: RefreshToken | null = null;
    for (const candidate of userRefreshTokens) {
      const isMatch = await this.cryptographyAdapter.compare({
        plainText: oldRefreshToken,
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

    await this.refreshTokenRepository.revokeRefreshTokenById(matchedRefreshToken.id);

    return this.generateNewTokens({
      accountId: user.id,
      userRole: user.role,
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
      plainText: refreshToken,
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
