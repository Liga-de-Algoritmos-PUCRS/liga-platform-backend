import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';

@Injectable()
export class LogoutService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute(userId: string): Promise<void> {
    // O Prisma remove da cláusula `where` todo campo `undefined` em vez de
    // traduzi-lo para `IS NULL`. Sem esta trava, um userId vazio transformaria o
    // updateMany numa revogação dos refresh tokens de todos os usuários.
    if (!userId) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'Missing user id on logout',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    await this.refreshTokenRepository.revokeAllRefreshTokensByAccountId(userId);
  }
}
