import { Injectable } from '@nestjs/common';
import { Problem } from '@/modules/Problem/domain/problem.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { UpdateProblemDTO } from '@/modules/Problem/application/dtos/update-problem.dto';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class UpdateProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly UserRepository: UserRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(
    id: string,
    updateProblemDTO: UpdateProblemDTO,
    userId: string,
  ): Promise<Problem> {
    const existingProblem = await this.ProblemRepository.getProblem(id);
    if (!existingProblem) {
      throw this.ExceptionsAdapter.notFound({
        message: `[updateProblemService].execute --> Problem not found with id: ${id}`,
      });
    }

    const user = await this.UserRepository.getUser(userId);
    if (!user) {
      throw this.ExceptionsAdapter.notFound({
        message: `[updateProblemService].execute --> User not found with id: ${userId}`,
      });
    }

    existingProblem.title = updateProblemDTO.title ?? existingProblem.title;
    existingProblem.description = updateProblemDTO.description ?? existingProblem.description;
    existingProblem.difficulty = updateProblemDTO.difficulty ?? existingProblem.difficulty;
    existingProblem.input = updateProblemDTO.input ?? existingProblem.input;
    existingProblem.answer = updateProblemDTO.answer ?? existingProblem.answer;
    existingProblem.bannerUrl = updateProblemDTO.bannerUrl ?? existingProblem.bannerUrl;
    existingProblem.points = updateProblemDTO.points ?? existingProblem.points;
    existingProblem.updatedAt = new Date();

    const updatedProblem = await this.ProblemRepository.updateProblem(existingProblem);

    this.LoggerAdapter.log({
      where: 'UpdateProblemService.Execute',
      message: `Updated problem in database with id: ${updatedProblem.id}`,
    });

    return updatedProblem;
  }
}
