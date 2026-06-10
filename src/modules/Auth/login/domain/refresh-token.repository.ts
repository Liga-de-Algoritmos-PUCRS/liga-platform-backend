import { RefreshToken } from './refresh-token.entity';

export abstract class RefreshTokenRepository {
  public abstract createRefreshToken(refreshToken: RefreshToken): Promise<void>;
  public abstract findRefreshTokenById(id: string): Promise<RefreshToken | null>;
  public abstract revokeAllRefreshTokensByAccountId(userId: string): Promise<void>;
  public abstract revokeRefreshTokenById(id: string): Promise<void>;
  public abstract deleteStaleRefreshTokens(now: Date, revokedBefore: Date): Promise<number>;
}
