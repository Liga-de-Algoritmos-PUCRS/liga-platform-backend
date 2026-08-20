import { Injectable } from '@nestjs/common';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { CreateSubmitDTO } from '@/modules/Submit/application/dtos/create-submit.dto';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import {
  Transaction,
  TransactionAdapter,
} from '@/infrastructure/Database/Transaction/transaction.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';

/**
 * Modelo de pontuacao competitiva: o problema vale menos a cada aluno distinto
 * que o resolve, e o aluno leva o valor corrente do instante do acerto,
 * congelado. Errar nao custa nada, e cada aluno so pontua uma vez por problema.
 */
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

    const solved = createSubmitDTO.answer.trim() === problem.answer.trim();

    const submit = await this.TransactionAdapter.transaction((tx) =>
      this.register(createSubmitDTO.problemId, userId, solved, tx),
    );

    this.LoggerAdapter.log({
      message: solved
        ? `User ${user.name} solved problem ${problem.title} for ${submit.pointsEarned} points`
        : `User ${user.name} submitted a wrong answer to problem ${problem.title}`,
      where: 'CreateSubmitService',
    });

    return submit;
  }

  /**
   * Tudo o que segue roda numa transacao so: ou o aluno pontua, o problema cai
   * de valor e os contadores sobem juntos, ou nada disso acontece.
   */
  private async register(
    problemId: string,
    userId: string,
    solved: boolean,
    tx: Transaction,
  ): Promise<Submit> {
    // A linha do problema e travada ANTES de tocar na submissao, e nao na hora
    // de creditar. Nao e ordem estetica: o INSERT em `submissions` pega um lock
    // de chave estrangeira (FOR KEY SHARE) na linha do problema, e pedir o
    // FOR UPDATE depois disso faz dois alunos acertando ao mesmo tempo
    // esperarem um pelo outro -- deadlock, que o Postgres resolve matando uma
    // das transacoes. Travando primeiro, a ordem e sempre problema -> submissao
    // -> usuario e nao ha ciclo.
    //
    // Sem o lock, os dois leriam o mesmo valor corrente e os dois levariam a
    // pontuacao do primeiro.
    const current = solved ? await this.ProblemRepository.lockCurrentPoints(problemId, tx) : null;
    if (solved && !current) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'Problem not found',
        internal: `[CreateSubmitService].execute --> Problem not found with id: ${problemId}`,
      });
    }

    const now = new Date();
    const inserted = await this.SubmitRepository.insertIfAbsent(
      new Submit({
        problemId,
        userId,
        // So vira o valor congelado depois que este aluno ganhar o INSERT.
        pointsEarned: 0,
        attempts: 1,
        isFinished: solved,
        finishedAt: solved ? now : undefined,
        createdAt: now,
        updatedAt: now,
      }),
      tx,
    );

    if (!inserted) {
      // O aluno ja tinha submissao para este problema. Quando ela ja estava
      // resolvida, nao ha o que contar: e uma segunda tentativa depois do
      // acerto, ou uma das requisicoes paralelas que perdeu a corrida.
      const registered = await this.SubmitRepository.registerAttempt(userId, problemId, solved, tx);
      if (!registered) {
        throw this.ExceptionsAdapter.conflict({
          message: 'You already solved this problem',
          internal: `[CreateSubmitService].execute --> User ${userId} already solved problem ${problemId}`,
        });
      }
    }

    await this.UserRepository.incrementUserSubmissions(userId, tx);

    // `current` so existe quando a resposta estava certa: errar nao custa nada
    // e nao mexe no valor do problema, so conta a tentativa.
    if (!current) {
      await this.ProblemRepository.incrementProblemAttempts(problemId, tx);
      return await this.read(problemId, userId, tx);
    }

    // Congelado no instante do acerto: quem resolveu antes nao perde nada
    // quando o problema cair de valor mais tarde.
    const earned = current.points;
    const next = Math.max(current.floorPoints, current.points - current.decrement);

    await this.ProblemRepository.applySolve(problemId, next, tx);
    await this.SubmitRepository.setPointsEarned(userId, problemId, earned, tx);
    await this.UserRepository.incrementUserPoints(userId, earned, tx);
    await this.UserRepository.incrementUserProblemsResolved(userId, tx);

    return await this.read(problemId, userId, tx);
  }

  private async read(problemId: string, userId: string, tx: Transaction): Promise<Submit> {
    const submit = await this.SubmitRepository.findByProblemIdAndUserId(problemId, userId, tx);
    if (!submit) {
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Unable to complete the operation',
        internal: `[CreateSubmitService].execute --> Submission vanished for user ${userId} on problem ${problemId}`,
      });
    }
    return submit;
  }
}
