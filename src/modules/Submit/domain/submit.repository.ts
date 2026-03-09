import { Injectable } from '@nestjs/common';
import { Submit } from './submit.entity';

@Injectable()
export abstract class SubmitRepository {
  abstract createSubmit(submit: Submit): Promise<Submit>;
  abstract findById(id: string): Promise<Submit | null>;
  abstract findByProblemId(problemId: string): Promise<Submit[]>;
  abstract findByUserId(userId: string): Promise<Submit[]>;
  abstract findByProblemIdAndUserId(problemId: string, userId: string): Promise<Submit | null>;
  abstract findFinishedByUserId(userId: string): Promise<Submit | null>;
  abstract findAll(): Promise<Submit[]>;
  abstract updateSubmit(id: string, submit: Submit): Promise<Submit>;
  abstract deleteSubmit(id: string): Promise<void>;
}
