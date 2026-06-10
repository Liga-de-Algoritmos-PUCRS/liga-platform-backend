import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as ms from 'ms';
import { StringValue } from 'ms';
import { Env } from '@/global/env.schema';

@Injectable()
export class SetAuthCookiesService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  public execute(res: Response, refreshToken: string): void {
    const expireInString = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION');
    const expireInMs = ms(expireInString as StringValue);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: expireInMs,
      path: '/',
    });
  }
}
