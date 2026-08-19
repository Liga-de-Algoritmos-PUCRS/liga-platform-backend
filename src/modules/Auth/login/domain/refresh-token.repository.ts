import { RefreshToken } from './refresh-token.entity';

export abstract class RefreshTokenRepository {
  public abstract createRefreshToken(refreshToken: RefreshToken): Promise<void>;
  /**
   * Inclui tokens já revogados (mas ainda não expirados) — é o que permite
   * detectar reapresentação de um refresh token já rotacionado.
   */
  public abstract findNonExpiredRefreshTokensByAccountId(userId: string): Promise<RefreshToken[]>;
  public abstract revokeAllRefreshTokensByAccountId(userId: string): Promise<void>;
  /**
   * Revoga só se o token ainda estiver válido (compare-and-swap via
   * `WHERE isRevoked = false`) e devolve se revogou de fato. Duas
   * requisições de refresh concorrentes com o mesmo token podem ambas ler
   * `isRevoked = false` antes de qualquer uma escrever — sem essa troca
   * atômica, as duas passariam pelo `if (isRevoked)` e as duas emitiriam um
   * par de tokens novo a partir do mesmo token antigo.
   */
  public abstract revokeRefreshTokenById(id: string): Promise<boolean>;
  public abstract deleteExpiredRefreshTokens(): Promise<number>;
}
