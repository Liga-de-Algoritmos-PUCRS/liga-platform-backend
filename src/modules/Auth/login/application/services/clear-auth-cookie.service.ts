import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ClearAuthCookiesService {
  // Os atributos precisam ser idênticos aos usados no SetAuthCookiesService,
  // caso contrário o browser não remove o cookie.
  public execute(res: Response): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }
}
