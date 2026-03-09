import { Injectable } from '@nestjs/common';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class GetAllSubmitsService {
  constructor(
    private readonly SubmitRepository: SubmitRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(): Promise<Submit[]> {
    const submit = await this.SubmitRepository.findAll();
    if (!submit) {
      this.LoggerAdapter.error({
        message: `Submit not found`,
        where: 'GetAllSubmitsService',
      });
      throw this.ExceptionsAdapter.badRequest({
        message: `Submit not found`,
      });
    }
    this.LoggerAdapter.log({
      message: `Submit found`,
      where: 'GetAllSubmitsService',
    });
    return submit;
  }
}
