import { createHash } from 'crypto';

/**
 * bcrypt só considera os primeiros 72 bytes do texto. Um JWT desta app tem
 * ~72 bytes fixos de header + início do payload, e o `iat`/`exp` — os únicos
 * campos que diferem entre dois tokens do mesmo usuário — ficam fora dessa
 * janela: hashear o JWT inteiro faz todos os refresh tokens de um mesmo
 * usuário colidirem no bcrypt.compare. Reduzir a um digest sha256 de tamanho
 * fixo (64 chars hex, dentro dos 72 bytes) garante que o bcrypt hasheia e
 * compara o token inteiro, não só o prefixo.
 */
export function digestRefreshToken(jwt: string): string {
  return createHash('sha256').update(jwt).digest('hex');
}
