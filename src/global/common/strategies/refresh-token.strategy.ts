import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Env } from '@/global/env.schema';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenPayload } from '@/global/common/strategies/refresh-token-payload.dto';
import { REFRESH_TOKEN_COOKIE_NAME } from '@/modules/Auth/login/application/refresh-token-cookie';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(configService: ConfigService<Env, true>) {
    const secret = configService.get<string>('REFRESH_TOKEN_SECRET', {
      infer: true,
    });
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string,
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshTokenPayload): RefreshTokenPayload {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    return {
      sub: payload.sub,
      userRole: payload.userRole,
      iat: payload.iat,
      exp: payload.exp,
      refreshToken,
    };
  }
}
