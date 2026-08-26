import { RefreshToken } from './refresh-token.entity';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

export abstract class RefreshTokenRepository {
  public abstract createRefreshToken(refreshToken: RefreshToken, tx?: Transaction): Promise<void>;
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
   *
   * Grava `replacedByTokenId` no mesmo UPDATE que revoga o token antigo,
   * para permitir distinguir depois "reapresentação do pai imediato de uma
   * rotação legítima" de reuso real. Chamado sempre dentro da mesma
   * transação que cria o token novo — a FK `replaced_by_token_id` exige que
   * a linha referenciada já exista, então perder o CAS precisa desfazer o
   * `create` também (ver `RefreshTokenService.generateNewTokens`).
   */
  public abstract revokeRefreshTokenById(
    id: string,
    replacedByTokenId: string,
    tx?: Transaction,
  ): Promise<boolean>;
  /**
   * Reaponta `replacedByTokenId` de um token pai já revogado (órfão) para o
   * token vivo recém-gerado por uma recuperação de sessão (back#63). Sem
   * isso, o órfão continua apontando para o filho imediato que a própria
   * recuperação anterior acabou de revogar — uma reapresentação seguinte do
   * mesmo órfão encontraria esse filho morto, seria lida como reuso de 2+
   * gerações e derrubaria a família inteira, inclusive o token que a
   * recuperação anterior acabou de emitir. Não tem CAS: o órfão já está
   * revogado e não recebe requisições concorrentes disputando esse campo.
   */
  public abstract repointOrphanToLiveDescendant(
    orphanId: string,
    liveDescendantId: string,
    tx?: Transaction,
  ): Promise<void>;
  public abstract deleteExpiredRefreshTokens(): Promise<number>;
}
