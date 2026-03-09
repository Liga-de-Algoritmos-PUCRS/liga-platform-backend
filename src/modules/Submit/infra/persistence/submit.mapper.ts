import { Submit } from '../../domain/submit.entity';
import { Submission } from '@prisma/client';

export class SubmitMapper {
  static toDomain(submission: Submission): Submit {
    return new Submit(
      {
        problemId: submission.problemId,
        userId: submission.userId,
        pointsEarned: submission.pointsEarned,
        attempts: submission.attempts,
        isFinished: submission.isFinished,
        finishedAt: submission.finishedAt ?? undefined,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt ?? undefined,
      },
      submission.id,
    );
  }
  static toPersistence(submit: Submit): Submission {
    return {
      id: submit.id,
      userId: submit.userId,
      problemId: submit.problemId,
      pointsEarned: submit.pointsEarned,
      attempts: submit.attempts,
      isFinished: submit.isFinished,
      finishedAt: submit.finishedAt ?? null,
      createdAt: submit.createdAt,
      updatedAt: submit.updatedAt ?? null,
    };
  }
}
