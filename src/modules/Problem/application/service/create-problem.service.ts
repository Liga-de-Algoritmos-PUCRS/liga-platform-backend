import { Injectable } from '@nestjs/common';
import { Problem } from '@/modules/Problem/domain/problem.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { CreateProblemDTO } from '@/modules/Problem/application/dtos/create-problem.dto';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class CreateProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly UserRepository: UserRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(createProblemDTO: CreateProblemDTO, userId: string): Promise<Problem> {
    const user = await this.UserRepository.getUser(userId);
    if (!user) {
      throw this.ExceptionsAdapter.notFound({
        message: `[createProblemService].execute --> User not found with id: ${userId}`,
      });
    }

    const problem = new Problem({
      title: createProblemDTO.title,
      description: createProblemDTO.description,
      difficulty: createProblemDTO.difficulty,
      input: createProblemDTO.input,
      answer: createProblemDTO.answer,
      bannerUrl: createProblemDTO.bannerUrl,
      points: createProblemDTO.points,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdProblem = await this.ProblemRepository.createProblem(problem);

    this.LoggerAdapter.log({
      where: 'CreateProblemService.Execute',
      message: `Created problem in database with title: ${createdProblem.title}`,
    });

    return createdProblem;
  }
}
