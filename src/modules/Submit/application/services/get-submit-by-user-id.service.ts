import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { Submit } from '@/modules/Submit/domain/submit.entity';
import { SubmitRepository } from '@/modules/Submit/domain/submit.repository';
import { GetUserInterface } from '@/global/common/decorators/get-user.decorator';

@Injectable()
export class GetSubmitByUserIdService {
  constructor(
    private readonly SubmitRepository: SubmitRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  public async execute(userId: string, requester: GetUserInterface): Promise<Submit[]> {
    // Regra de dono, nao de papel: a rota e de qualquer autenticado, mas o
    // historico de submissoes de um usuario so pode ser lido por ele mesmo ou
    // por um admin -- que ja tem a listagem completa em GET /submit. Mesma
    // categoria do delete-user.service, por isso mora aqui e nao num guard.
    if (requester.userRole !== 'ADMIN' && requester.id !== userId) {
      throw this.ExceptionsAdapter.forbidden({
        message: `[getSubmitByUserIdService].execute --> User ${requester.id} is not allowed to read submissions from user ${userId}`,
      });
    }

    const submit = await this.SubmitRepository.findByUserId(userId);
    if (!submit) {
      this.LoggerAdapter.error({
        message: `Submit not found with id: ${userId}`,
        where: 'GetSubmitByUserIdService',
      });
      throw this.ExceptionsAdapter.badRequest({
        message: `Submit not found with id: ${userId}`,
      });
    }
    this.LoggerAdapter.log({
      message: `Submit found with id: ${userId}`,
      where: 'GetSubmitByUserIdService',
    });
    return submit;
  }
}
