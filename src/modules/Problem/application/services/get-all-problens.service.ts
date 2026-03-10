import { Injectable } from '@nestjs/common';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class GetAllProblemsService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute() {
    try {
      const problems = await this.ProblemRepository.getProblems();

      this.LoggerAdapter.log({
        where: 'GetAllProblemsService.Execute',
        message: `Retrieved all problems from database. Count: ${problems.length}`,
      });

      for (const problem of problems) {
        problem.answer = '';
      }

      return problems;
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[getAllProblemsService].execute --> Failed to retrieve problems from database | errorText: ${error}`,
      });
    }
  }
}
