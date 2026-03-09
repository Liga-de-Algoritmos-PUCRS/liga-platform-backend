import { Injectable } from '@nestjs/common';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class DeleteProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly UserRepository: UserRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(id: string, userId: string): Promise<void> {
    const existingProblem = await this.ProblemRepository.getProblem(id);
    if (!existingProblem) {
      throw this.ExceptionsAdapter.notFound({
        message: `[deleteProblemService].execute --> Problem not found with id: ${id}`,
      });
    }

    const user = await this.UserRepository.getUser(userId);
    if (!user) {
      throw this.ExceptionsAdapter.notFound({
        message: `[deleteProblemService].execute --> User not found with id: ${userId}`,
      });
    }

    if (user.role !== 'ADMIN') {
      throw this.ExceptionsAdapter.forbidden({
        message: `[deleteProblemService].execute --> User with role ${user.role} is not allowed to delete problems`,
      });
    }

    await this.ProblemRepository.deleteProblem(id);

    this.LoggerAdapter.log({
      where: 'DeleteProblemService.Execute',
      message: `Deleted problem from database with id: ${id}`,
    });
  }
}
