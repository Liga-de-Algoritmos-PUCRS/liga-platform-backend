import { createId } from '@paralleldrive/cuid2';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export const DEFAULT_INITIAL_POINTS = 100;
export const DEFAULT_FLOOR_POINTS = 70;
export const DEFAULT_DECREMENT = 5;

/**
 * Mantem o valor corrente dentro do intervalo configurado. Usado na criacao e
 * na edicao do problema: mudar os parametros nunca deixa o valor corrente fora
 * do que o admin acabou de configurar.
 */
export function clampPoints(points: number, floorPoints: number, initialPoints: number): number {
  return Math.min(initialPoints, Math.max(floorPoints, points));
}

export interface ProblemInterface {
  title: string;
  description: string;
  difficulty: Difficulty;
  answer: string;
  input: string;
  points: number;
  initialPoints?: number;
  floorPoints?: number;
  decrement?: number;
  bannerUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  resolved?: number;
  submissions?: number;
  fixed?: boolean;
  archived?: boolean;
}

export class Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  answer: string;
  input: string;
  /**
   * Valor corrente: quanto o proximo aluno a resolver leva. Cai `decrement` a
   * cada aluno distinto que resolve, com piso em `floorPoints`.
   */
  points: number;
  initialPoints: number;
  floorPoints: number;
  decrement: number;
  updatedAt?: Date;
  bannerUrl?: string | null;
  createdAt: Date;
  resolved: number;
  submissions: number;
  fixed: boolean;
  archived: boolean;

  constructor(problemInterface: ProblemInterface, id?: string) {
    this.id = id ?? createId();
    this.title = problemInterface.title;
    this.description = problemInterface.description;
    this.difficulty = problemInterface.difficulty;
    this.answer = problemInterface.answer;
    this.input = problemInterface.input;
    this.points = problemInterface.points;
    this.initialPoints = problemInterface.initialPoints ?? DEFAULT_INITIAL_POINTS;
    this.floorPoints = problemInterface.floorPoints ?? DEFAULT_FLOOR_POINTS;
    this.decrement = problemInterface.decrement ?? DEFAULT_DECREMENT;
    this.bannerUrl = problemInterface.bannerUrl || null;
    this.createdAt = new Date();
    this.updatedAt = problemInterface.updatedAt;
    this.resolved = problemInterface.resolved ?? 0;
    this.submissions = problemInterface.submissions ?? 0;
    this.fixed = problemInterface.fixed ?? false;
    this.archived = problemInterface.archived ?? false;
  }

  /**
   * Payload completo, com os parametros da corrida. So sai por rota admin.
   */
  public toJSON() {
    return {
      ...this.toPublicJSON(),
      initialPoints: this.initialPoints,
      floorPoints: this.floorPoints,
      decrement: this.decrement,
    };
  }

  /**
   * Payload das rotas publicas: mostra o valor corrente (`points`), mas nao
   * como ele foi configurado. Espelhado em `PublicProblemResponseDTO`.
   */
  public toPublicJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      answer: this.answer,
      input: this.input,
      points: this.points,
      bannerUrl: this.bannerUrl,
      createdAt: this.createdAt,
      resolved: this.resolved,
      submissions: this.submissions,
      fixed: this.fixed,
      archived: this.archived,
    };
  }
}
