import { Injectable } from '@nestjs/common';
import {
  Problem,
  clampPoints,
  DEFAULT_INITIAL_POINTS,
  DEFAULT_FLOOR_POINTS,
  DEFAULT_DECREMENT,
} from '@/modules/Problem/domain/problem.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { CreateProblemDTO } from '@/modules/Problem/application/dtos/create-problem.dto';

@Injectable()
export class CreateProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(createProblemDTO: CreateProblemDTO): Promise<Problem> {
    const initialPoints = createProblemDTO.initialPoints ?? DEFAULT_INITIAL_POINTS;
    const floorPoints = createProblemDTO.floorPoints ?? DEFAULT_FLOOR_POINTS;
    const decrement = createProblemDTO.decrement ?? DEFAULT_DECREMENT;

    // O DTO garante inteiro >= 0 em cada campo; o que so da para conferir aqui
    // e a relacao entre eles.
    if (floorPoints > initialPoints) {
      throw this.ExceptionsAdapter.badRequest({
        message: `floorPoints (${floorPoints}) cannot be greater than initialPoints (${initialPoints})`,
        internal: `[CreateProblemService].execute --> floorPoints (${floorPoints}) cannot be greater than initialPoints (${initialPoints})`,
      });
    }

    const problem = new Problem({
      title: createProblemDTO.title,
      description: createProblemDTO.description,
      difficulty: createProblemDTO.difficulty,
      input: createProblemDTO.input,
      answer: createProblemDTO.answer,
      bannerUrl: createProblemDTO.bannerUrl,
      points: clampPoints(createProblemDTO.points ?? initialPoints, floorPoints, initialPoints),
      initialPoints,
      floorPoints,
      decrement,
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
