import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { ValidateResetPasswordDTO } from '@/modules/Auth/resetPassword/application/dtos/validate.dto';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/domain/reset-password-token.repository';
import { TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { MAX_TOKEN_ATTEMPTS } from '@/modules/Auth/auth.constants';
import { ResetPasswordToken } from '@/modules/Auth/resetPassword/domain/reset-password-token.entity';

const INVALID_CODE_MESSAGE = 'Invalid or expired code';

@Injectable()
export class IsValidateResetPasswordService {
  constructor(
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly UserRepository: UserRepository,
    private readonly ResetPasswordTokenRepository: ResetPasswordTokenRepository,
  ) {}

  async execute(ValidateResetPasswordDTO: ValidateResetPasswordDTO): Promise<void> {
    const findToken = await this.resolveToken(ValidateResetPasswordDTO);

    // Todos os ramos de falha daqui pra baixo respondem a mesma mensagem:
    // depois de re-chavear por e-mail, "tem token valido" quase equivale a
    // "tem conta", entao diferenciar o motivo reabriria a enumeracao.
    if (!findToken) {
      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Token not found (by id or by email)',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (findToken.isRevoked) {
      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Token already used/revoked',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (findToken.expiresAt < new Date()) {
      await this.ResetPasswordTokenRepository.revokeResetPasswordTokenById(findToken.id);
      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Token expired',
        internalKey: TokenExceptions.TOKEN_EXPIRED,
      });
    }

    if (findToken.token !== ValidateResetPasswordDTO.token) {
      const attempt = await this.ResetPasswordTokenRepository.incrementAttempts(
        findToken.id,
        MAX_TOKEN_ATTEMPTS,
      );

      if (attempt === null) {
        throw this.ExceptionsAdapter.badRequest({
          message: INVALID_CODE_MESSAGE,
          internal: 'Token already used/revoked (race on increment)',
          internalKey: TokenExceptions.TOKEN_INVALID,
        });
      }

      if (attempt.revoked) {
        throw this.ExceptionsAdapter.badRequest({
          message: INVALID_CODE_MESSAGE,
          internal: 'Maximum number of attempts exceeded',
          internalKey: TokenExceptions.TOKEN_ATTEMPTS_EXCEEDED,
        });
      }

      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Wrong code',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }
  }

  private async resolveToken(dto: ValidateResetPasswordDTO): Promise<ResetPasswordToken | null> {
    if (dto.email) {
      const user = await this.UserRepository.findUserByEmail(dto.email);
      if (!user) {
        return null;
      }
      return this.ResetPasswordTokenRepository.findValidResetPasswordTokenByUserId(user.id);
    }

    // Retrocompat transitoria: front antigo ainda manda tokenId.
    return this.ResetPasswordTokenRepository.findValidResetPasswordToken(dto.tokenId as string);
  }
}
