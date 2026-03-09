import { createId } from '@paralleldrive/cuid2';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ProblemInterface {
  title: string;
  description: string;
  difficulty: Difficulty;
  answer: string;
  input: string;
  points: number;
  bannerUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  resolved?: number;
  submissions?: number;
}

export class Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  answer: string;
  input: string;
  points: number;
  updatedAt?: Date;
  bannerUrl?: string | null;
  createdAt: Date;
  resolved: number;
  submissions: number;

  constructor(problemInterface: ProblemInterface, id?: string) {
    this.id = id ?? createId();
    this.title = problemInterface.title;
    this.description = problemInterface.description;
    this.difficulty = problemInterface.difficulty;
    this.answer = problemInterface.answer;
    this.input = problemInterface.input;
    this.points = problemInterface.points;
    this.bannerUrl = problemInterface.bannerUrl || null;
    this.createdAt = new Date();
    this.updatedAt = problemInterface.updatedAt;
    this.resolved = problemInterface.resolved ?? 0;
    this.submissions = problemInterface.submissions ?? 0;
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      input: this.input,
      points: this.points,
      bannerUrl: this.bannerUrl,
      createdAt: this.createdAt,
      resolved: this.resolved,
      submissions: this.submissions,
    };
  }
}
