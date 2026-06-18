import { RefreshToken } from './refresh-token.entity';

export abstract class RefreshTokenRepository {
  public abstract createRefreshToken(refreshToken: RefreshToken): Promise<void>;
  public abstract findValidRefreshTokensByAccountId(userId: string): Promise<RefreshToken[]>;
  public abstract revokeAllRefreshTokensByAccountId(userId: string): Promise<void>;
  public abstract revokeRefreshTokenById(id: string): Promise<void>;
}
