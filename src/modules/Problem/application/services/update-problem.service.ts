import { Injectable } from '@nestjs/common';
import { Problem, clampPoints } from '@/modules/Problem/domain/problem.entity';
import { ProblemRepository } from '@/modules/Problem/domain/problem.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { UpdateProblemDTO } from '@/modules/Problem/application/dtos/update-problem.dto';

@Injectable()
export class UpdateProblemService {
  constructor(
    private readonly ProblemRepository: ProblemRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(id: string, updateProblemDTO: UpdateProblemDTO): Promise<Problem> {
    const existingProblem = await this.ProblemRepository.getProblem(id);
    if (!existingProblem) {
      throw this.ExceptionsAdapter.notFound({
        message: `[updateProblemService].execute --> Problem not found with id: ${id}`,
      });
    }

    existingProblem.title = updateProblemDTO.title ?? existingProblem.title;
    existingProblem.description = updateProblemDTO.description ?? existingProblem.description;
    existingProblem.difficulty = updateProblemDTO.difficulty ?? existingProblem.difficulty;
    existingProblem.input = updateProblemDTO.input ?? existingProblem.input;
    existingProblem.answer = updateProblemDTO.answer ?? existingProblem.answer;
    existingProblem.bannerUrl = updateProblemDTO.bannerUrl ?? existingProblem.bannerUrl;

    // Parametros da corrida: mudar a configuracao vale dali para frente. Quem
    // ja pontuou fica com o que ganhou -- nada aqui toca em submissoes.
    const initialPoints = updateProblemDTO.initialPoints ?? existingProblem.initialPoints;
    const floorPoints = updateProblemDTO.floorPoints ?? existingProblem.floorPoints;

    if (floorPoints > initialPoints) {
      throw this.ExceptionsAdapter.badRequest({
        message: `[UpdateProblemService].execute --> floorPoints (${floorPoints}) cannot be greater than initialPoints (${initialPoints})`,
      });
    }

    existingProblem.initialPoints = initialPoints;
    existingProblem.floorPoints = floorPoints;
    existingProblem.decrement = updateProblemDTO.decrement ?? existingProblem.decrement;
    // Clampa mesmo quando o `points` nao veio no corpo: o intervalo pode ter
    // mudado por baixo do valor corrente. E tambem como o admin reinicia a
    // corrida, mandando `points` de volta para o inicial.
    existingProblem.points = clampPoints(
      updateProblemDTO.points ?? existingProblem.points,
      floorPoints,
      initialPoints,
    );

    existingProblem.archived = updateProblemDTO.archived ?? existingProblem.archived;
    existingProblem.fixed = updateProblemDTO.fixed ?? existingProblem.fixed;
    existingProblem.updatedAt = new Date();

    const updatedProblem = await this.ProblemRepository.updateProblem(existingProblem);

    this.LoggerAdapter.log({
      where: 'UpdateProblemService.Execute',
      message: `Updated problem in database with id: ${updatedProblem.id}`,
    });

    return updatedProblem;
  }
}
