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
    // Sem userId o where do Prisma vira `undefined` e o updateMany revogaria os
    // refresh tokens de todos os usuarios.
    if (!userId) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'Missing user id on logout',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    await this.refreshTokenRepository.revokeAllRefreshTokensByAccountId(userId);
  }
}
