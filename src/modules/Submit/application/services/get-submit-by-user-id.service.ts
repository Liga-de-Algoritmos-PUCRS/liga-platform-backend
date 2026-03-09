import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';

@Injectable()
export class GetSubmitByUserIdService {
  constructor(
    private readonly SubmitRepository: SubmitRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(userId: string): Promise<Submit[]> {
    const submit = await this.SubmitRepository.findByUserId(userId);
    if (!submit) {
      this.LoggerAdapter.error({
        message: `Submit not found with id: ${userId}`,
        where: 'GetSubmitByUserIdService',
      });
      throw this.ExceptionsAdapter.badRequest({
        message: `Submit not found with id: ${userId}`,
      });
    }
    this.LoggerAdapter.log({
      message: `Submit found with id: ${userId}`,
      where: 'GetSubmitByUserIdService',
    });
    return submit;
  }
}
