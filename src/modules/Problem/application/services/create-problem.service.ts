import { Injectable } from '@nestjs/common';
import { Problem } from '@/modules/Problem/domain/problem.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { CreateProblemDTO } from '@/modules/Problem/application/dtos/create-problem.dto';

@Injectable()
export class CreateProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(createProblemDTO: CreateProblemDTO): Promise<Problem> {
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
      fixed: createProblemDTO.fixed,
      archived: createProblemDTO.archived,
    });

    const createdProblem = await this.ProblemRepository.createProblem(problem);

    this.LoggerAdapter.log({
      where: 'CreateProblemService.Execute',
      message: `Created problem in database with title: ${createdProblem.title}`,
    });

    return createdProblem;
  }
}
