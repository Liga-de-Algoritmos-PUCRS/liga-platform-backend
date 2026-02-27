import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '@/modules/User/domain/user.entity';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';

@Injectable()
export class ResetUserPointsService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute(userId: string): Promise<User> {
    const existingUser = await this.UserRepository.findUserById(userId);
    if (!existingUser) {
      throw this.ExceptionsAdapter.notFound({
        message: 'User not found with the provided ID',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    if (existingUser.role === 'ADMIN') {
      throw this.ExceptionsAdapter.forbidden({
        message: 'Admins cannot have their points reset',
      });
    }

    await this.UserRepository.resetAllMonthlyPoints();

    return existingUser;
  }
}
