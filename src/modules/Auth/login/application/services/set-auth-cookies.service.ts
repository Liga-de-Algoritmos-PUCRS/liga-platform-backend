import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as ms from 'ms';
import { StringValue } from 'ms';
import { Env } from '@/global/env.schema';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { CookiesAdapter } from '@/infrastructure/Cookies/cookies.adapter';
import { CookieOptions } from 'express-serve-static-core';

@Injectable()
export class SetAuthCookiesService {
  constructor(
    private readonly ConfigService: ConfigService<Env, true>,
    @Inject(CookiesAdapter)
    private readonly CookiesAdapter: CookiesAdapter,
    private readonly AccountRepository: AccountRepository,
  ) {}

  public async execute(res: Response, userId: string, refreshToken: string): Promise<void> {
    const expireInString = this.ConfigService.get<string>('REFRESH_TOKEN_EXPIRATION');
    const expireInMs = ms(expireInString as StringValue);
    const cfCookieDomain = this.ConfigService.get<string>('CLOUDFRONT_COOKIE_BASE_DOMAIN');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: expireInMs,
      path: '/',
    });

    const author = await this.AccountRepository.getAccountById(userId);
    const signedCookies = this.CookiesAdapter.generateSignedCookies(author!.workspaceId);

    const cfCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true, // Obrigatório para sameSite: 'none'
      sameSite: 'none', // Permite envio para o domínio do CloudFront
      domain: cfCookieDomain,
      path: '/',
      maxAge: expireInMs,
    };

    res.cookie('CloudFront-Policy', signedCookies.policy, cfCookieOptions);
    res.cookie('CloudFront-Signature', signedCookies.signature, cfCookieOptions);
    res.cookie('CloudFront-Key-Pair-Id', signedCookies.keyPairId, cfCookieOptions);
  }
}
