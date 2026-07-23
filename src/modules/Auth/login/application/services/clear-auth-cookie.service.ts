import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ClearAuthCookiesService {
  public execute(res: Response): void {
    // Os atributos precisam ser identicos aos do SetAuthCookiesService, senao o
    // navegador nao remove o cookie e a sessao "volta" no proximo refresh.
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }
}
