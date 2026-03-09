import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class DeleteSubmitService {
  constructor(
    private readonly SubmitRepository: SubmitRepository,
    private readonly UserRepository: UserRepository,
    private readonly TransactionAdapter: TransactionAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(id: string): Promise<void> {
    const submit = await this.SubmitRepository.findById(id);
    if (!submit) {
      throw this.ExceptionsAdapter.badRequest({
        message: `Submit not found with id: ${id}`,
      });
    }
    await this.TransactionAdapter.transaction(async () => {
      await this.SubmitRepository.deleteSubmit(id);
      await this.UserRepository.decrementUserPoints(submit.userId, submit.pointsEarned);
    });
    this.LoggerAdapter.log({
      message: `Submit deleted with id: ${id}`,
      where: 'DeleteSubmitService',
    });
    return;
  }
}
