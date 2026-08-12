import { Injectable } from '@nestjs/common';
import { SubmitMapper } from './submit.mapper';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

@Injectable()
export class PrismaSubmitRepository implements SubmitRepository {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {}

  public async createSubmit(submit: Submit): Promise<Submit> {
    try {
      const submitToPersist = SubmitMapper.toPersistence(submit);

      const createdSubmit = await this.Prisma.submission.create({
        data: submitToPersist,
      });

      if (createdSubmit) {
        this.LoggerAdapter.log({
          where: 'SubmitRepository.CreateSubmit',
          message: `New submit in database: ${JSON.stringify(createdSubmit)}`,
        });

        return SubmitMapper.toDomain(createdSubmit);
      } else {
        throw this.ExceptionsAdapter.internalServerError({
          message: `[submit.repository].createSubmit --> Submit was not created in database under problemId: ${submit.problemId}`,
        });
      }
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[submit.repository].createSubmit --> Submit was not created in database under problemId: ${submit.problemId} | errorText: ${error}`,
      });
    }
  }

  public async findById(id: string): Promise<Submit | null> {
    const submit = await this.Prisma.submission.findUnique({
      where: { id },
    });

    if (!submit) {
      return null;
    }

    return SubmitMapper.toDomain(submit);
  }

  public async findByProblemId(problemId: string): Promise<Submit[]> {
    const submits = await this.Prisma.submission.findMany({
      where: { problemId },
    });
    this.LoggerAdapter.log({
      where: 'SubmitRepository.GetSubmits',
      message: `Retrieved all submits from database. Count: ${submits.length}`,
    });
    return submits.map((submit) => SubmitMapper.toDomain(submit));
  }

  public async findByUserId(userId: string): Promise<Submit[]> {
    const submits = await this.Prisma.submission.findMany({
      where: { userId },
    });
    this.LoggerAdapter.log({
      where: 'SubmitRepository.GetSubmits',
      message: `Retrieved all submits from database. Count: ${submits.length}`,
    });
    return submits.map((submit) => SubmitMapper.toDomain(submit));
  }

  public async findAll(): Promise<Submit[]> {
    const submits = await this.Prisma.submission.findMany();
    this.LoggerAdapter.log({
      where: 'SubmitRepository.GetSubmits',
      message: `Retrieved all submits from database. Count: ${submits.length}`,
    });
    return submits.map((submit) => SubmitMapper.toDomain(submit));
  }

  public async updateSubmit(id: string, submit: Submit): Promise<Submit> {
    try {
      const submitToPersist = SubmitMapper.toPersistence(submit);

      const updatedSubmit = await this.Prisma.submission.update({
        where: { id },
        data: submitToPersist,
      });

      if (updatedSubmit) {
        this.LoggerAdapter.log({
          where: 'SubmitRepository.UpdateSubmit',
          message: `Updated submit in database: ${JSON.stringify(updatedSubmit)}`,
        });

        return SubmitMapper.toDomain(updatedSubmit);
      } else {
        throw this.ExceptionsAdapter.internalServerError({
          message: `[submit.repository].updateSubmit --> Submit was not updated in database under problemId: ${submit.problemId}`,
        });
      }
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[submit.repository].updateSubmit --> Submit was not updated in database under problemId: ${submit.problemId} | errorText: ${error}`,
      });
    }
  }

  public async deleteSubmit(id: string, tx?: Transaction): Promise<void> {
    try {
      const client = tx ?? this.Prisma;

      await client.submission.delete({
        where: { id },
      });

      this.LoggerAdapter.log({
        where: 'SubmitRepository.DeleteSubmit',
        message: `Deleted submit in database with id: ${id}`,
      });

      return;
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[submit.repository].deleteSubmit --> Submit was not deleted in database with id: ${id} | errorText: ${error}`,
      });
    }
  }

  public async findByProblemIdAndUserId(
    problemId: string,
    userId: string,
    tx?: Transaction,
  ): Promise<Submit | null> {
    const client = tx ?? this.Prisma;

    // Pelo indice unico, e nao mais um `findFirst` que corre com as paralelas.
    const submit = await client.submission.findUnique({
      where: { userProblem: { userId, problemId } },
    });

    if (!submit) {
      return null;
    }

    return SubmitMapper.toDomain(submit);
  }

  public async findFinishedByUserId(userId: string): Promise<Submit | null> {
    const submit = await this.Prisma.submission.findFirst({
      where: { userId, isFinished: true },
    });

    if (!submit) {
      return null;
    }

    return SubmitMapper.toDomain(submit);
  }

  public async insertIfAbsent(submit: Submit, tx?: Transaction): Promise<boolean> {
    const client = tx ?? this.Prisma;
    const row = SubmitMapper.toPersistence(submit);

    const inserted = await client.$executeRaw`
      INSERT INTO "submissions" ("id", "user_id", "problem_id", "points_earned", "attempts",
                                 "created_at", "is_finished", "finished_at", "updated_at")
      VALUES (${row.id}, ${row.userId}, ${row.problemId}, ${row.pointsEarned}, ${row.attempts},
              ${row.createdAt}, ${row.isFinished}, ${row.finishedAt}, ${row.updatedAt})
      ON CONFLICT ("user_id", "problem_id") DO NOTHING`;

    return inserted === 1;
  }

  public async registerAttempt(
    userId: string,
    problemId: string,
    solved: boolean,
    tx?: Transaction,
  ): Promise<boolean> {
    const client = tx ?? this.Prisma;
    const now = new Date();

    // O `isFinished: false` no filtro e o que faz a corrida ter um vencedor so:
    // quem chega depois do acerto atualiza zero linhas.
    const { count } = await client.submission.updateMany({
      where: { userId, problemId, isFinished: false },
      data: solved
        ? { attempts: { increment: 1 }, isFinished: true, finishedAt: now }
        : { attempts: { increment: 1 } },
    });

    return count > 0;
  }

  public async setPointsEarned(
    userId: string,
    problemId: string,
    pointsEarned: number,
    tx?: Transaction,
  ): Promise<void> {
    const client = tx ?? this.Prisma;

    await client.submission.update({
      where: { userProblem: { userId, problemId } },
      data: { pointsEarned },
    });
  }
}
