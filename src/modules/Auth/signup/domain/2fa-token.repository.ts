import { Token2Fa } from './2fa-token.entity';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

export abstract class Token2FARepository {
  public abstract createToken2FA(token2Fa: Token2Fa): Promise<Token2Fa>;
  public abstract findValidToken2FA(id: string): Promise<Token2Fa | null>;
  public abstract revokeToken2FaById(id: string, tx?: Transaction): Promise<boolean>;
  public abstract incrementAttempts(
    id: string,
    maxAttempts: number,
  ): Promise<{ attempts: number; revoked: boolean } | null>;
  public abstract revokeAllValidTokensByEmail(email: string): Promise<void>;
}
