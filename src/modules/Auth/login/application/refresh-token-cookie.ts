import { CookieOptions } from 'express';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

/**
 * O navegador só remove um cookie quando os atributos do `clearCookie` são
 * idênticos aos do `cookie` original — nome, `path`, `secure`, `sameSite` e
 * `httpOnly`. Quando divergem, o cookie sobrevive ao logout e a sessão "volta"
 * no próximo refresh. Manter as duas pontas nesta constante evita a divergência.
 */
export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
};
