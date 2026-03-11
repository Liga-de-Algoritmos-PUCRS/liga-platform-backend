import { Injectable } from '@nestjs/common';
import { Problem } from '@/modules/Problem/domain/problem.entity';
import { ProblemMapper } from '@/modules/Problem/infra/persistence/problem.mapper';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';

@Injectable()
export class PrismaProblemRepository implements ProblemRepository {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {}

  public async createProblem(problem: Problem): Promise<Problem> {
    try {
      const problemToPersist = ProblemMapper.toPersistence(problem);

      const createdProblem = await this.Prisma.problem.create({
        data: problemToPersist,
      });

      if (createdProblem) {
        this.LoggerAdapter.log({
          where: 'ProblemRepository.CreateProblem',
          message: `New problem in database: ${JSON.stringify(createdProblem)}`,
        });

        return ProblemMapper.toDomain(createdProblem);
      } else {
        throw this.ExceptionsAdapter.internalServerError({
          message: `[problem.repository].createProblem --> Problem was not created in database under title: ${problem.title}`,
        });
      }
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[problem.repository].createProblem --> Problem was not created in database under title: ${problem.title} | errorText: ${error}`,
      });
    }
  }

  public async getProblem(id: string): Promise<Problem | null> {
    const problem = await this.Prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      return null;
    }

    return ProblemMapper.toDomain(problem);
  }

  public async getProblems(): Promise<Problem[]> {
    const problems = await this.Prisma.problem.findMany({
      where: {
        archived: false,
      },
    });
    this.LoggerAdapter.log({
      where: 'ProblemRepository.GetProblems',
      message: `Retrieved all problems from database. Count: ${problems.length}`,
    });
    return problems.map((problem) => ProblemMapper.toDomain(problem));
  }

  public async getProblemsWithArchived(): Promise<Problem[]> {
    const problems = await this.Prisma.problem.findMany();
    this.LoggerAdapter.log({
      where: 'ProblemRepository.GetProblems',
      message: `Retrieved all problems from database. Count: ${problems.length}`,
    });
    return problems.map((problem) => ProblemMapper.toDomain(problem));
  }

  public async updateProblem(problem: Problem): Promise<Problem> {
    try {
      const problemToPersist = ProblemMapper.toPersistence(problem);

      const updatedProblem = await this.Prisma.problem.update({
        where: { id: problem.id },
        data: problemToPersist,
      });

      if (updatedProblem) {
        this.LoggerAdapter.log({
          where: 'ProblemRepository.UpdateProblem',
          message: `Updated problem in database: ${JSON.stringify(updatedProblem)}`,
        });

        return ProblemMapper.toDomain(updatedProblem);
      } else {
        throw this.ExceptionsAdapter.internalServerError({
          message: `[problem.repository].updateProblem --> Problem was not updated in database under title: ${problem.title}`,
        });
      }
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[problem.repository].updateProblem --> Problem was not updated in database under title: ${problem.title} | errorText: ${error}`,
      });
    }
  }

  public async deleteProblem(id: string): Promise<boolean> {
    try {
      await this.Prisma.problem.delete({
        where: { id },
      });

      this.LoggerAdapter.log({
        where: 'ProblemRepository.DeleteProblem',
        message: `Deleted problem in database with id: ${id}`,
      });

      return true;
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[problem.repository].deleteProblem --> Problem was not deleted in database with id: ${id} | errorText: ${error}`,
      });
    }
  }

  public async incrementProblemSubmissions(id: string, correct: boolean): Promise<Problem> {
    try {
      const problem = await this.Prisma.problem.update({
        where: { id },
        data: {
          submits: {
            increment: 1,
          },
          resolved: correct
            ? {
                increment: 1,
              }
            : undefined,
        },
      });

      if (problem) {
        this.LoggerAdapter.log({
          where: 'ProblemRepository.IncrementProblemSubmissions',
          message: `Incremented problem submissions in database: ${problem.id}`,
        });

        return ProblemMapper.toDomain(problem);
      } else {
        throw this.ExceptionsAdapter.internalServerError({
          message: `[problem.repository].incrementProblemSubmissions --> Problem was not incremented in database with id: ${id}`,
        });
      }
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[problem.repository].incrementProblemSubmissions --> Problem was not incremented in database with id: ${id} | errorText: ${error}`,
      });
    }
  }
}
