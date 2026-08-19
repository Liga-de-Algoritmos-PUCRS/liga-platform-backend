import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { ResetPasswordTokenRepository } from '@/modules/Auth/resetPassword/domain/reset-password-token.repository';
import { ResetPasswordDTO } from '@/modules/Auth/resetPassword/application/dtos/reset-password.dto';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { UserExceptions, TokenExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { MAX_TOKEN_ATTEMPTS } from '@/modules/Auth/auth.constants';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly UserRepository: UserRepository,
    private readonly ResetPasswordTokenRepository: ResetPasswordTokenRepository,
    private readonly SendEmailAdapter: SendEmailAdapter,
    private readonly CryptographyAdapter: CryptographyAdapter,
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

    await this.SendEmailAdapter.sendEmailPaswordChanged(user.email, user.name);

    await this.ResetPasswordTokenRepository.revokeResetPasswordTokenById(findToken.id);
  }

  private isSafetyPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length > 8 && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
  }
}
