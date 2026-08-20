import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { ValidateSignupDTO } from '@/modules/Auth/signup/application/dtos/validate.dto';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { Token2FARepository } from '@/modules/Auth/signup/domain/2fa-token.repository';
import { Token2Fa } from '@/modules/Auth/signup/domain/2fa-token.entity';
import { User } from '@/modules/User/domain/user.entity';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { TokenExceptions, UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import {
  Transaction,
  TransactionAdapter,
} from '@/infrastructure/Database/Transaction/transaction.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { MAX_TOKEN_ATTEMPTS } from '@/modules/Auth/auth.constants';

const INVALID_CODE_MESSAGE = 'Invalid or expired code';

@Injectable()
export class ValidateSignupService {
  constructor(
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly UserRepository: UserRepository,
    private readonly TransactionAdapter: TransactionAdapter,
    private readonly Token2FARepository: Token2FARepository,
    private readonly SendEmailAdapter: SendEmailAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  async execute(validateSignupDTO: ValidateSignupDTO): Promise<User> {
    const findToken2Fa = await this.resolveToken(validateSignupDTO);

    // Todos os ramos de falha daqui pra baixo respondem a mesma mensagem:
    // depois de re-chavear por e-mail, "tem token valido" quase equivale a
    // "tem conta", entao diferenciar o motivo reabriria a enumeracao.
    if (!findToken2Fa) {
      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Token not found (by id or by email)',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (findToken2Fa.isRevoked) {
      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Token already used/revoked',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (findToken2Fa.expiresAt < new Date()) {
      await this.Token2FARepository.revokeToken2FaById(findToken2Fa.id);

      throw this.ExceptionsAdapter.badRequest({
        message: INVALID_CODE_MESSAGE,
        internal: 'Token expired',
        internalKey: TokenExceptions.TOKEN_EXPIRED,
      });
    }

    if (findToken2Fa.token !== validateSignupDTO.token) {
      const attempt = await this.Token2FARepository.incrementAttempts(
        findToken2Fa.id,
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

    const user: User = await this.TransactionAdapter.transaction(async (tx: Transaction) => {
      const user = await this.UserRepository.createUser(
        new User({
          name: findToken2Fa.userInfo2Fa.name,
          email: findToken2Fa.userInfo2Fa.email,
          password: findToken2Fa.userInfo2Fa.password,
          role: 'USER',
        }),
        tx,
      );

      await this.Token2FARepository.revokeToken2FaById(findToken2Fa.id, tx);

      return user;
    });

    if (user) {
      try {
        await this.SendEmailAdapter.sendEmailWelcome(user.email, user.name);
      } catch (error) {
        this.LoggerAdapter.error({
          where: 'ValidateSignupService',
          message: `Failed to send welcome email to ${user.email}: ${error}`,
        });
      }
    } else {
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Unable to complete the operation',
        internal: 'user not created',
        internalKey: UserExceptions.USER_NOT_CREATED,
      });
    }

    return user;
  }

  private async resolveToken(dto: ValidateSignupDTO): Promise<Token2Fa | null> {
    if (dto.email) {
      return this.Token2FARepository.findValidToken2FAByEmail(dto.email);
    }

    // Retrocompat transitoria: front antigo ainda manda tokenId.
    return this.Token2FARepository.findValidToken2FA(dto.tokenId as string);
  }
}
