import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { CryptographyAdapter } from '@/infrastructure/Criptography/cryptography.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class DeleteUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  async execute(deleteUserid: string, userId: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw this.exceptionsAdapter.notFound({
        message: 'User not found with the provided ID',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    if (user.role === 'ADMIN') {
      this.LoggerAdapter.log({
        message: `Deleting user with id: ${deleteUserid}`,
        where: 'DeleteUserService',
      });
      return await this.userRepository.deleteUser(deleteUserid);
    }

    // A senha conferida abaixo e a de quem pediu, nao a do dono da conta
    // alvo. Sem esta checagem, qualquer usuario apagava a conta de qualquer
    // outro bastando informar a propria senha.
    if (deleteUserid !== userId) {
      throw this.exceptionsAdapter.forbidden({
        message: 'User not allowed to delete another account',
        internalKey: UserExceptions.USER_NOT_ALLOWED,
      });
    }

    const isPasswordValid = await this.cryptographyAdapter.compare({
      plainText: password,
      cryptographedText: user.password,
    });

    if (!isPasswordValid) {
      throw this.exceptionsAdapter.unauthorized({
        message: 'Invalid password provided',
        internalKey: UserExceptions.USER_INVALID_PASSWORD,
      });
    }
    this.LoggerAdapter.log({
      message: `Deleting user with id: ${deleteUserid}`,
      where: 'DeleteUserService',
    });
    return await this.userRepository.deleteUser(deleteUserid);
  }
}
