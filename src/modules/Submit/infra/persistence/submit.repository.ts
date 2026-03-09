import { Injectable } from '@nestjs/common';
import { SubmitMapper } from './submit.mapper';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';

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

  public async deleteSubmit(id: string): Promise<void> {
    try {
      await this.Prisma.submission.delete({
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

  public async findByProblemIdAndUserId(problemId: string, userId: string): Promise<Submit | null> {
    const submit = await this.Prisma.submission.findFirst({
      where: { problemId: problemId, userId: userId },
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
}
