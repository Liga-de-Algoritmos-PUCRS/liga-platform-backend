import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';

const REVOKED_RETENTION_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CleanupRefreshTokensService {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async execute(): Promise<void> {
    const now = new Date();
    const revokedBefore = new Date(now.getTime() - REVOKED_RETENTION_MS);
    await this.refreshTokenRepository.deleteStaleRefreshTokens(now, revokedBefore);
  }
}
