import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { ResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/domain/reset-password-token.repository';
import { ResetPasswordDTO } from '@/modules/Auth/resetPassword/application/dtos/reset-password.dto';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { UserExceptions, TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { MAX_TOKEN_ATTEMPTS } from '@/modules/Auth/auth.constants';
import { RefreshTokenRepository } from '@/modules/Auth/login/domain/refresh-token.repository';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly UserRepository: UserRepository,
    private readonly ResetPasswordTokenRepository: ResetPasswordTokenRepository,
    private readonly SendEmailAdapter: SendEmailAdapter,
    private readonly CryptographyAdapter: CryptographyAdapter,
    private readonly RefreshTokenRepository: RefreshTokenRepository,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  async execute(ResetPasswordDTO: ResetPasswordDTO): Promise<void> {
    const findToken = await this.ResetPasswordTokenRepository.findValidResetPasswordToken(
      ResetPasswordDTO.tokenId,
    );

    if (!findToken) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'Invalid or expired token',
        internalKey: TokenExceptions.TOKEN_EXPIRED,
      });
    }

    if (findToken.isRevoked) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'This token has already been used',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    if (findToken.expiresAt < new Date()) {
      await this.ResetPasswordTokenRepository.revokeResetPasswordTokenById(findToken.id);
      throw this.ExceptionsAdapter.badRequest({
        message: 'This token has expired',
        internalKey: TokenExceptions.TOKEN_EXPIRED,
      });
    }

    if (findToken.token !== ResetPasswordDTO.token) {
      const attempt = await this.ResetPasswordTokenRepository.incrementAttempts(
        findToken.id,
        MAX_TOKEN_ATTEMPTS,
      );

      if (attempt === null) {
        throw this.ExceptionsAdapter.badRequest({
          message: 'This token has already been used',
          internalKey: TokenExceptions.TOKEN_INVALID,
        });
      }

      if (attempt.revoked) {
        throw this.ExceptionsAdapter.badRequest({
          message: 'Maximum number of attempts exceeded',
          internalKey: TokenExceptions.TOKEN_ATTEMPTS_EXCEEDED,
        });
      }

      throw this.ExceptionsAdapter.badRequest({
        message: 'Invalid token',
        internalKey: TokenExceptions.TOKEN_INVALID,
      });
    }

    const user = await this.UserRepository.findUserById(findToken.userId);
    if (!user) {
      throw this.ExceptionsAdapter.notFound({
        message: 'User not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    if (!this.isSafetyPassword(ResetPasswordDTO.newPassword)) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'Your password is not strong enough',
        internalKey: UserExceptions.USER_NOT_SAFETY_PASSWORD,
      });
    }

    const hashedPassword = await this.CryptographyAdapter.hash({
      plainText: ResetPasswordDTO.newPassword,
      hashSalt: 8,
    });

    // Troca a senha na propria entidade em vez de reconstruir o usuario campo
    // a campo. A copia manual esquecia `submissions`, e como o mapper grava
    // `submissionsNumber: user.submissions ?? 0`, trocar a senha zerava o
    // contador de submissoes de quem resetasse.
    user.password = hashedPassword;

    await this.UserRepository.updateUser(user);

    // Revoga as sessoes ativas antes do token de reset: uma sessao roubada nao
    // pode sobreviver a troca de senha, e uma falha real de banco aqui deixa o
    // token ainda valido para retry (nao fica queimado por uma falha alheia).
    await this.RefreshTokenRepository.revokeAllRefreshTokensByAccountId(user.id);

    await this.ResetPasswordTokenRepository.revokeResetPasswordTokenById(findToken.id);

    // Envio de e-mail e best-effort e vem por ultimo: com senha trocada e
    // token ja revogado, uma falha do SES nao pode virar 500 nem deixar o
    // token reutilizavel.
    try {
      await this.SendEmailAdapter.sendEmailPaswordChanged(user.email, user.name);
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'ResetPasswordService',
        message: `Failed to send password changed email to ${user.email}: ${error}`,
      });
    }
  }

  private isSafetyPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length > 8 && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
  }
}
