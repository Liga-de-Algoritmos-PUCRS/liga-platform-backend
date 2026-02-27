import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '@/modules/User/domain/user.entity';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class GetTopUserService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  async execute(): Promise<User[]> {
    const topUser = await this.UserRepository.findAllTimeTopUsers(10);
    if (!topUser || topUser.length === 0) {
      throw this.ExceptionsAdapter.notFound({
        message: 'No top user found',
      });
    }
    this.LoggerAdapter.log({
      where: 'GetTopUserService',
      message: `Top user retrieved successfully`,
    });
    return topUser;
  }
}
