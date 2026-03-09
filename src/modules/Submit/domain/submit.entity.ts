import { createId } from '@paralleldrive/cuid2';

export interface SubmitInterface {
  problemId: string;
  userId: string;
  pointsEarned: number;
  attempts: number;
  isFinished: boolean;
  updatedAt?: Date;
  finishedAt?: Date;
  createdAt?: Date;
}

export class Submit {
  id: string;
  problemId: string;
  userId: string;
  pointsEarned: number;
  attempts: number;
  isFinished: boolean;
  updatedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;

  constructor(submitInterface: SubmitInterface, id?: string) {
    this.id = id ?? createId();
    this.problemId = submitInterface.problemId;
    this.userId = submitInterface.userId;
    this.pointsEarned = submitInterface.pointsEarned;
    this.attempts = submitInterface.attempts;
    this.isFinished = submitInterface.isFinished;
    this.updatedAt = submitInterface.updatedAt;
    this.finishedAt = submitInterface.finishedAt;
    this.createdAt = submitInterface.createdAt ?? new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      userId: this.userId,
      pointsEarned: this.pointsEarned,
      attempts: this.attempts,
      isFinished: this.isFinished,
      updatedAt: this.updatedAt,
      finishedAt: this.finishedAt,
      createdAt: this.createdAt,
    };
  }
}
