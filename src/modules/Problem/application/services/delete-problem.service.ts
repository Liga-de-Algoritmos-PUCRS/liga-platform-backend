import { Injectable } from '@nestjs/common';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class DeleteProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(id: string): Promise<void> {
    const existingProblem = await this.ProblemRepository.getProblem(id);
    if (!existingProblem) {
      throw this.ExceptionsAdapter.notFound({
        message: 'Problem not found',
        internal: `[deleteProblemService].execute --> Problem not found with id: ${id}`,
      });
    }

    await this.ProblemRepository.deleteProblem(id);

    this.LoggerAdapter.log({
      where: 'DeleteProblemService.Execute',
      message: `Deleted problem from database with id: ${id}`,
    });
  }
}
