import { Injectable } from '@nestjs/common';
import { Problem } from './problem.entity';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

/**
 * Parametros da corrida lidos com a linha do problema travada, dentro da
 * transacao do acerto.
 */
export interface CurrentPoints {
  points: number;
  floorPoints: number;
  decrement: number;
}

@Injectable()
export abstract class ProblemRepository {
  public abstract createProblem(problem: Problem): Promise<Problem>;
  public abstract getProblem(id: string): Promise<Problem | null>;
  public abstract getProblems(): Promise<Problem[]>;
  public abstract getProblemsWithArchived(): Promise<Problem[]>;
  public abstract updateProblem(problem: Problem): Promise<Problem>;
  public abstract deleteProblem(id: string): Promise<boolean>;
  /**
   * Le o valor corrente com `SELECT ... FOR UPDATE`. E o que serializa dois
   * alunos acertando ao mesmo tempo: o segundo so le depois que o primeiro
   * commitou, e por isso leva o valor ja decrementado em vez do mesmo do
   * primeiro. Exige transacao -- fora dela o lock morre na hora.
   */
  public abstract lockCurrentPoints(id: string, tx: Transaction): Promise<CurrentPoints | null>;
  /** Aplica o acerto de um aluno distinto: novo valor corrente, +1 resolvido, +1 submissao. */
  public abstract applySolve(id: string, points: number, tx?: Transaction): Promise<void>;
  /** Tentativa que nao resolveu: so conta a submissao. */
  public abstract incrementProblemAttempts(id: string, tx?: Transaction): Promise<void>;
  /**
   * Desfaz um acerto (admin apagando a submissao): devolve um decremento ao
   * valor corrente, com teto no inicial, e tira um do contador de resolvidos.
   */
  public abstract revertSolve(id: string, tx?: Transaction): Promise<void>;
}
