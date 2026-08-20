import { randomInt } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { SignupRequestDTO } from '@/modules/Auth/signup/application/dtos/signup.dto';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { Token2FARepository } from '@/modules/Auth/signup/domain/2fa-token.repository';
import { Token2Fa } from '@/modules/Auth/signup/domain/2fa-token.entity';
import { SendEmailAdapter } from '@/infrastructure/SendEmail/sendEmail.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

const SIGNUP_TOKEN_EXPIRES_IN_SECONDS = 10 * 60;

@Injectable()
export class SignupService {
  constructor(
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly CryptographyAdapter: CryptographyAdapter,
    private readonly UserRepository: UserRepository,
    private readonly Token2FARepository: Token2FARepository,
    private readonly SendEmailAdapter: SendEmailAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  // Validacoes de input primeiro, consulta ao banco depois -- e nao mais
  // "e-mail em uso" primeiro -- para o corpo/timing nao denunciar quem tem
  // conta antes mesmo de validar o que o requester mandou.
  async execute(
    signupRequest: SignupRequestDTO,
  ): Promise<{ message: string; expiresInSeconds: number }> {
    if (!signupRequest.email.includes('pucrs')) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'This email is not from PUCRS',
      });
    }

    if (!this.isSafetyPassword(signupRequest.password)) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'Your password is not strong enough',
      });
    }

    const findUserEmail = await this.UserRepository.findUserByEmail(signupRequest.email);

    // Roda sempre, exista ou nao a conta, para o custo de CPU do hash nao
    // denunciar qual dos dois ramos foi tomado.
    const hashedPassword = await this.CryptographyAdapter.hash({
      plainText: signupRequest.password,
      hashSalt: 8,
    });

    if (findUserEmail) {
      void this.SendEmailAdapter.sendEmailAccountExists(
        signupRequest.email,
        findUserEmail.name,
      ).catch((error) => {
        this.LoggerAdapter.error({
          where: 'SignupService',
          message: `Failed to send account-exists email to ${signupRequest.email}: ${error}`,
        });
      });
    } else {
      const generateToken2Fa = randomInt(0, 1_000_000).toString().padStart(6, '0');
      const newToken2Fa = new Token2Fa(
        {
          token: generateToken2Fa,
          expiresAt: new Date(Date.now() + SIGNUP_TOKEN_EXPIRES_IN_SECONDS * 1000),
          createdAt: new Date(),
          isRevoked: false,
          attempts: 0,
        },
        {
          name: signupRequest.name,
          email: signupRequest.email,
          password: hashedPassword,
        },
      );

      await this.Token2FARepository.revokeAllValidTokensByEmail(signupRequest.email);
      await this.Token2FARepository.createToken2FA(newToken2Fa);

      void this.SendEmailAdapter.sendEmail2FA(
        signupRequest.email,
        generateToken2Fa,
        signupRequest.name,
      ).catch((error) => {
        this.LoggerAdapter.error({
          where: 'SignupService',
          message: `Failed to send 2FA email to ${signupRequest.email}: ${error}`,
        });
      });
    }

    return {
      message: 'If this email is available, we sent a verification code.',
      expiresInSeconds: SIGNUP_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  private isSafetyPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length > 8 && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
  }
}
