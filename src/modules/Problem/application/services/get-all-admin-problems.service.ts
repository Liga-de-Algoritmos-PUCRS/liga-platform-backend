import { Injectable } from '@nestjs/common';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class GetAllAdminProblemsService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(id: string) {
    try {
      const problems = await this.ProblemRepository.getProblemsWithArchived();

      this.LoggerAdapter.log({
        where: 'GetAllProblemsService.Execute',
        message: `Retrieved all problems from database. Count: ${problems.length}, id: ${id}`,
      });

      return problems;
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[getAllProblemsService].execute --> Failed to retrieve problems from database | errorText: ${error}`,
      });
    }
  }
}
