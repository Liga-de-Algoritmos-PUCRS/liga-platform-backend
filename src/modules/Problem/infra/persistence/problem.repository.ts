import { Injectable } from '@nestjs/common';
import { Problem } from '@/modules/Problem/domain/problem.entity';
import { ProblemMapper } from '@/modules/Problem/infra/persistence/problem.mapper';
import { CurrentPoints, ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

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

  public async lockCurrentPoints(id: string, tx: Transaction): Promise<CurrentPoints | null> {
    const rows = await tx.$queryRaw<
      { points: number; floor_points: number; decrement: number }[]
    >`SELECT "points", "floor_points", "decrement" FROM "problems" WHERE "id" = ${id} FOR UPDATE`;

    if (rows.length === 0) {
      return null;
    }

    return {
      points: rows[0].points,
      floorPoints: rows[0].floor_points,
      decrement: rows[0].decrement,
    };
  }

  public async applySolve(id: string, points: number, tx?: Transaction): Promise<void> {
    const client = tx ?? this.Prisma;

    await client.problem.update({
      where: { id },
      data: {
        points,
        resolved: { increment: 1 },
        submits: { increment: 1 },
      },
    });

    this.LoggerAdapter.log({
      where: 'ProblemRepository.ApplySolve',
      message: `Problem ${id} solved by a new user. Current value is now ${points}`,
    });
  }

  public async incrementProblemAttempts(id: string, tx?: Transaction): Promise<void> {
    const client = tx ?? this.Prisma;

    await client.problem.update({
      where: { id },
      data: { submits: { increment: 1 } },
    });
  }

  public async revertSolve(id: string, tx?: Transaction): Promise<void> {
    const client = tx ?? this.Prisma;

    // Devolve exatamente um decremento -- que foi o quanto aquele acerto
    // custou ao problema -- e nao o `pointsEarned` do aluno, que e o valor
    // corrente inteiro daquele instante e inflaria o problema. `LEAST` e
    // `GREATEST` mantem os limites no proprio banco.
    await client.$executeRaw`
      UPDATE "problems"
      SET "points" = LEAST("initial_points", "points" + "decrement"),
          "resolved" = GREATEST(0, "resolved" - 1)
      WHERE "id" = ${id}`;

    this.LoggerAdapter.log({
      where: 'ProblemRepository.RevertSolve',
      message: `Reverted a solve on problem ${id}`,
    });
  }
}
