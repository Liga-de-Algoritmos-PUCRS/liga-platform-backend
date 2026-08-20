import { randomInt } from 'crypto';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { ResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/domain/reset-password-token.repository';
import { ResetPasswordRequestDTO } from '@/modules/Auth/resetPassword/application/dtos/request-token.dto';
import { ResetPasswordToken } from '../../domain/reset-password-token.entity';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { AUTH_EMAIL_BRANCH_MIN_RESPONSE_MS } from '@/modules/Auth/auth.constants';
import { withMinimumResponseTime } from '@/modules/Auth/constant-time-response';

const RESET_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;

@Injectable()
export class RequestResetPasswordService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly ResetPasswordTokenRepository: ResetPasswordTokenRepository,
    private readonly SendEmailAdapter: SendEmailAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  // Sempre 200 com o mesmo corpo, exista ou nao o e-mail -- senao o status
  // vira um oraculo de quem tem conta. O envio do e-mail e disparado sem
  // await para o SES nao entrar no timing da resposta, e o piso fixo de tempo
  // esconde as duas escritas que so o ramo com conta faz (sem ele, medido,
  // 98% das respostas sem conta chegavam antes da mais rapida com conta).
  async execute(ResetPasswordRequestDTO: ResetPasswordRequestDTO): Promise<{
    message: string;
    expiresInSeconds: number;
  }> {
    return withMinimumResponseTime(AUTH_EMAIL_BRANCH_MIN_RESPONSE_MS, () =>
      this.issueToken(ResetPasswordRequestDTO),
    );
  }

  private async issueToken(ResetPasswordRequestDTO: ResetPasswordRequestDTO): Promise<{
    message: string;
    expiresInSeconds: number;
  }> {
    const user = await this.UserRepository.findUserByEmail(ResetPasswordRequestDTO.email);

    if (user) {
      const generatedTokenResetPassword = randomInt(0, 1_000_000).toString().padStart(6, '0');

      const ResetToken = new ResetPasswordToken({
        userId: user.id,
        token: generatedTokenResetPassword,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_SECONDS * 1000),
        isRevoked: false,
        attempts: 0,
      });

      await this.ResetPasswordTokenRepository.revokeAllValidTokensByUserId(user.id);
      await this.ResetPasswordTokenRepository.createResetPasswordToken(ResetToken);

      void this.SendEmailAdapter.sendEmailResetPassword(
        user.email,
        generatedTokenResetPassword,
        user.name,
      ).catch((error) => {
        this.LoggerAdapter.error({
          where: 'RequestResetPasswordService',
          message: `Failed to send reset password email to ${user.email}: ${error}`,
        });
      });
    }

    return {
      message: 'If this email exists, a code has been sent.',
      expiresInSeconds: RESET_TOKEN_EXPIRES_IN_SECONDS,
    };
  }
}
