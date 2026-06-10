import { Injectable } from '@nestjs/common';
import { LoginResponseInterface } from '@/modules/Auth/login/application/dtos/refreshToken';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { LoginRequestDTO } from '@/modules/Auth/login/application/dtos/login.dto';
import { GenerateTokensService } from '@/modules/Auth/login/application/services/generate-tokens.service';
import { UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly generateTokensService: GenerateTokensService,
  ) {}

  async execute(loginRequest: LoginRequestDTO): Promise<LoginResponseInterface> {
    const { email, password } = loginRequest;

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw this.exceptionsAdapter.badRequest({
        message: 'Invalid email or password',
        internalKey: UserExceptions.USER_INVALID_CREDENTIALS,
      });
    }

    const verifyPassword = await this.cryptographyAdapter.compare({
      plainText: password,
      cryptographedText: user.password,
    });

    if (!verifyPassword) {
      throw this.exceptionsAdapter.badRequest({
        message: 'Invalid email or password',
      });
    }

    return {
      ...(await this.generateTokensService.execute({
        accountId: user.id,
        userRole: user.role,
      })),
      userId: user.id,
    };
  }
}
