import { Injectable } from '@nestjs/common';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { CreateSubmitDTO } from '@/modules/Submit/application/dtos/create-submit.dto';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class CreateSubmitService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly SubmitRepository: SubmitRepository,
    private readonly UserRepository: UserRepository,
    private readonly TransactionAdapter: TransactionAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(createSubmitDTO: CreateSubmitDTO, userId: string): Promise<Submit> {
    const problem = await this.ProblemRepository.getProblem(createSubmitDTO.problemId);
    if (!problem) {
      this.LoggerAdapter.error({
        message: `Problem not found with id: ${createSubmitDTO.problemId}`,
        where: 'CreateSubmitService',
      });
      throw this.ExceptionsAdapter.badRequest({
        message: `Problem not found with id: ${createSubmitDTO.problemId}`,
      });
    }

    const user = await this.UserRepository.findUserById(userId);
    if (!user) {
      this.LoggerAdapter.error({
        message: `User not found with id: ${userId}`,
        where: 'CreateSubmitService',
      });
      throw this.ExceptionsAdapter.badRequest({
        message: `User not found with id: ${userId}`,
      });
    }

    const submit = await this.SubmitRepository.findByProblemIdAndUserId(
      createSubmitDTO.problemId,
      userId,
    );
    if (submit) {
      if (submit.isFinished) {
        throw this.ExceptionsAdapter.badRequest({
          message: `User already finished this problem`,
        });
      }

      submit.attempts += 1;
      submit.updatedAt = new Date();

      if (createSubmitDTO.answer === problem.answer) {
        submit.isFinished = true;
        submit.finishedAt = new Date();
      }

      submit.pointsEarned = problem.points - submit.attempts;

      await this.TransactionAdapter.transaction(async () => {
        await this.UserRepository.incrementUserSubmissions(user.id);
        await this.SubmitRepository.updateSubmit(submit.id, submit);
        if (submit.isFinished) {
          await this.UserRepository.incrementUserProblemsResolved(user.id);
          await this.UserRepository.incrementUserPoints(user.id, submit.pointsEarned);
          await this.ProblemRepository.incrementProblemSubmissions(createSubmitDTO.problemId, true);
        } else {
          await this.ProblemRepository.incrementProblemSubmissions(
            createSubmitDTO.problemId,
            false,
          );
        }
      });

      this.LoggerAdapter.log({
        message: `User ${user.name} finished problem ${problem.title}`,
        where: 'CreateSubmitService',
      });

      return submit;
    }

    const newSubmit = new Submit({
      problemId: createSubmitDTO.problemId,
      userId: userId,
      pointsEarned: problem.points,
      attempts: 1,
      isFinished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (createSubmitDTO.answer === problem.answer) {
      newSubmit.isFinished = true;
      newSubmit.finishedAt = new Date();
    }

    const createdSubmit = await this.TransactionAdapter.transaction(async () => {
      await this.UserRepository.incrementUserPoints(user.id, newSubmit.pointsEarned);
      return await this.SubmitRepository.createSubmit(newSubmit);
    });

    this.LoggerAdapter.log({
      message: `User ${user.name} created submit for problem ${problem.title}`,
      where: 'CreateSubmitService',
    });

    return createdSubmit;
  }
}
