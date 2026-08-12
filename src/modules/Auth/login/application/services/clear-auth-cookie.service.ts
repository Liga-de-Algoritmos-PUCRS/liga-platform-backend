import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/modules/Auth/login/application/refresh-token-cookie';

@Injectable()
export class ClearAuthCookiesService {
  public execute(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
  }
}
