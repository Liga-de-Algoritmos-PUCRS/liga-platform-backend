import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class PruneRefreshTokensService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly loggerAdapter: LoggerAdapter,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async execute(): Promise<void> {
    const deletedCount = await this.refreshTokenRepository.deleteExpiredRefreshTokens();

    this.loggerAdapter.log({
      where: 'PruneRefreshTokensService.execute',
      message: `Deleted ${deletedCount} expired refresh tokens`,
    });
  }
}
