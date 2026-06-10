import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { Env } from '@/global/env.schema';

@Injectable()
export class LogoutService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async execute(refreshTokenCookie?: string): Promise<void> {
    if (!refreshTokenCookie) {
      return;
    }

    // ignoreExpiration: um cookie expirado mas genuíno ainda revoga a própria
    // sessão; assinatura inválida (token forjado) não revoga nada.
    let jti: string | undefined;
    try {
      const payload = await this.jwtService.verifyAsync<{ jti?: string }>(refreshTokenCookie, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        ignoreExpiration: true,
      });
      jti = payload?.jti;
    } catch {
      return;
    }

    if (jti) {
      await this.refreshTokenRepository.revokeRefreshTokenById(jti);
    }
  }
}
