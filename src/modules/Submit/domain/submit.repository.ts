import { Injectable } from '@nestjs/common';
import { Submit } from './submit.entity';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

@Injectable()
export abstract class SubmitRepository {
  abstract createSubmit(submit: Submit): Promise<Submit>;
  abstract findById(id: string): Promise<Submit | null>;
  abstract findByProblemId(problemId: string): Promise<Submit[]>;
  abstract findByUserId(userId: string): Promise<Submit[]>;
  abstract findByProblemIdAndUserId(
    problemId: string,
    userId: string,
    tx?: Transaction,
  ): Promise<Submit | null>;
  abstract findFinishedByUserId(userId: string): Promise<Submit | null>;
  abstract findAll(): Promise<Submit[]>;
  abstract updateSubmit(id: string, submit: Submit): Promise<Submit>;
  abstract deleteSubmit(id: string, tx?: Transaction): Promise<void>;
  /**
   * Insere a submissao se o aluno ainda nao tinha uma para este problema, e
   * devolve se inseriu. E `INSERT ... ON CONFLICT DO NOTHING` cru de proposito:
   * deixar o Prisma levantar `P2002` aqui poria a transacao do Postgres em
   * estado abortado e mataria todas as queries seguintes.
   */
  abstract insertIfAbsent(submit: Submit, tx?: Transaction): Promise<boolean>;
  /**
   * Conta mais uma tentativa na submissao que ja existe, e marca como resolvida
   * quando `solved`. Devolve `false` se a submissao ja estava resolvida -- e
   * assim que as requisicoes paralelas perdedoras descobrem que perderam, sem
   * creditar nada.
   */
  abstract registerAttempt(
    userId: string,
    problemId: string,
    solved: boolean,
    tx?: Transaction,
  ): Promise<boolean>;
  /** Grava o valor congelado no instante do acerto. */
  abstract setPointsEarned(
    userId: string,
    problemId: string,
    pointsEarned: number,
    tx?: Transaction,
  ): Promise<void>;
}
