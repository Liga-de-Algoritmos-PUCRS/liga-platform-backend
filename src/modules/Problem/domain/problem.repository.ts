import { Injectable } from '@nestjs/common';
import { Problem } from './problem.entity';

@Injectable()
export abstract class ProblemRepository {
  public abstract createProblem(problem: Problem): Promise<Problem>;
  public abstract getProblem(id: string): Promise<Problem | null>;
  public abstract getProblems(): Promise<Problem[]>;
  public abstract updateProblem(problem: Problem): Promise<Problem>;
  public abstract deleteProblem(id: string): Promise<boolean>;
  public abstract incrementProblemSubmissions(id: string, correct: boolean): Promise<Problem>;
}
