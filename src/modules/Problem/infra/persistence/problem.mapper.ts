import { Problem, Difficulty } from '@/modules/Problem/domain/problem.entity';
import { Problem as PrismaProblem, DifficultyEnum } from '@prisma/client';

export class ProblemMapper {
  static toDomain(problem: PrismaProblem): Problem {
    const model = new Problem(
      {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty as Difficulty,
        answer: problem.answer,
        input: problem.input,
        points: problem.points,
        bannerUrl: problem.bannerUrl || null,
        createdAt: problem.createdAt,
        submissions: problem.submits,
        resolved: problem.resolved,
        fixed: problem.fixed,
        archived: problem.archived,
      },
      problem.id,
    );
    return model;
  }

  static toPersistence(problem: Problem): PrismaProblem {
    return {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty as DifficultyEnum,
      createdAt: problem.createdAt,
      input: problem.input,
      answer: problem.answer,
      points: problem.points,
      bannerUrl: problem.bannerUrl || null,
      updatedAt: problem.updatedAt || null,
      resolved: problem.resolved,
      submits: problem.submissions,
      fixed: problem.fixed,
      archived: problem.archived,
    };
  }
}
