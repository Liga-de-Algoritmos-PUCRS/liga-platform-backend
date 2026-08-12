import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';

@Injectable()
export class DeleteSubmitService {
  constructor(
    private readonly SubmitRepository: SubmitRepository,
    private readonly UserRepository: UserRepository,
    private readonly ProblemRepository: ProblemRepository,
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

    await this.TransactionAdapter.transaction(async (tx) => {
      await this.SubmitRepository.deleteSubmit(id, tx);

      // Submissao que nunca resolveu nada nao pontuou e nao derrubou o valor do
      // problema: apagar a linha e tudo o que ha para fazer.
      if (!submit.isFinished) {
        return;
      }

      // De proposito, os contadores de tentativa nao voltam: o
      // `submissionsNumber` do aluno e o `submits` do problema registram que a
      // tentativa aconteceu, e isso continua verdade depois que o admin apaga
      // a linha. Nenhum dos dois entra no ranking -- so os pontos e o
      // `problemsResolved`, que sao justamente os que sao desfeitos aqui.
      await this.UserRepository.decrementUserPoints(submit.userId, submit.pointsEarned, tx);
      await this.UserRepository.decrementUserProblemsResolved(submit.userId, tx);
      await this.ProblemRepository.revertSolve(submit.problemId, tx);
    });

    this.LoggerAdapter.log({
      message: `Submit deleted with id: ${id}`,
      where: 'DeleteSubmitService',
    });
    return;
  }
}
