import { Injectable } from '@nestjs/common';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class GetAdminProblemByIdService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly UserRepository: UserRepository,
  ) {}

  public async execute(id: string, userId: string) {
    const problem = await this.ProblemRepository.getProblem(id);
    if (!problem) {
      throw this.ExceptionsAdapter.notFound({
        message: `[getProblemByIdService].execute --> Problem not found with id: ${id}`,
      });
    }

    const user = await this.UserRepository.findUserById(userId);

    if (!user || user.role !== 'ADMIN') {
      this.LoggerAdapter.log({
        where: 'GetProblemByIdService.Execute',
        message: `Retrieved problem from database with id: ${problem.id}`,
      });
      throw this.ExceptionsAdapter.forbidden({
        message: `[getProblemByIdService].execute --> User not authorized to access this problem`,
      });
    }

    return problem;
  }
}
