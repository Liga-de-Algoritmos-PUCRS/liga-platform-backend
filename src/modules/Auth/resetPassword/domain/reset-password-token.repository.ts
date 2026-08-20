import { ResetPasswordToken } from './reset-password-token.entity';

export abstract class ResetPasswordTokenRepository {
  public abstract createResetPasswordToken(
    token2Fa: ResetPasswordToken,
  ): Promise<ResetPasswordToken>;
  public abstract findValidResetPasswordToken(id: string): Promise<ResetPasswordToken | null>;
  public abstract findValidResetPasswordTokenByUserId(
    userId: string,
  ): Promise<ResetPasswordToken | null>;
  public abstract revokeResetPasswordTokenById(id: string): Promise<boolean>;
  public abstract incrementAttempts(
    id: string,
    maxAttempts: number,
  ): Promise<{ attempts: number; revoked: boolean } | null>;
  public abstract revokeAllValidTokensByUserId(userId: string): Promise<void>;
}
