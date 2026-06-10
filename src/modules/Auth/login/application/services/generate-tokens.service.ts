import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createId } from '@paralleldrive/cuid2';
import { StringValue } from 'ms';
import * as ms from 'ms';
import {
  TokenParams,
  TokensResponseInterface,
} from '@/modules/Auth/login/application/dtos/refreshToken';
import { RefreshToken } from '@/modules/Auth/login/domain/refresh-token.entity';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { Env } from '@/global/env.schema';

@Injectable()
export class GenerateTokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(tokenParams: TokenParams): Promise<TokensResponseInterface> {
    const payload = {
      sub: tokenParams.accountId,
      userRole: tokenParams.userRole,
    };

    // O jti vincula o JWT de refresh à sua linha no banco, permitindo
    // lookup determinístico na rotação.
    const tokenId = createId();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION') as StringValue,
      }),
      this.jwtService.signAsync(
        { ...payload, jti: tokenId },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') as StringValue,
        },
      ),
    ]);

    const hashedToken = await this.cryptographyAdapter.hash({
      plainText: refreshToken,
      hashSalt: 8,
    });

    const expireInString = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION');
    const expireInMs = ms(expireInString as StringValue);
    const expiresAt = new Date(Date.now() + expireInMs);

    const newRefreshToken = new RefreshToken(
      {
        token: hashedToken,
        accountId: tokenParams.accountId,
        expiresAt,
        isRevoked: false,
        revokedAt: null,
        createdAt: new Date(),
      },
      tokenId,
    );

    await this.refreshTokenRepository.createRefreshToken(newRefreshToken);

    return { accessToken, refreshToken };
  }
}
