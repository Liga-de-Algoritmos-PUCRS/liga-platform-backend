import { Injectable } from '@nestjs/common';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class GetProblemByIdService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(id: string) {
    const problem = await this.ProblemRepository.getProblem(id);
    if (!problem) {
      throw this.ExceptionsAdapter.notFound({
        message: 'Problem not found',
        internal: `[getProblemByIdService].execute --> Problem not found with id: ${id}`,
      });
    }

    this.LoggerAdapter.log({
      where: 'GetProblemByIdService.Execute',
      message: `Retrieved problem from database with id: ${problem.id}`,
    });

    problem.answer = '';
    // `toPublicJSON()` deixa de fora os parametros da corrida
    // (initialPoints/floorPoints/decrement), que so saem por rota admin.
    return problem.toPublicJSON();
  }
}
