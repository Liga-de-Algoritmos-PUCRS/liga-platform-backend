import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '@/modules/User/domain/user.entity';
import { AdjustUserPointsDTO } from '@/modules/User/application/dtos/adjust-user-points.dto';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { GetUserInterface } from '@/global/common/decorators/get-user.decorator';

@Injectable()
export class AdjustUserPointsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly loggerAdapter: LoggerAdapter,
  ) {}

  async execute(
    userId: string,
    dto: AdjustUserPointsDTO,
    requester: GetUserInterface,
  ): Promise<User> {
    if (dto.allTimePointsDelta === undefined && dto.monthlyPointsDelta === undefined) {
      throw this.exceptionsAdapter.badRequest({
        message: 'At least one of allTimePointsDelta or monthlyPointsDelta must be provided',
      });
    }

    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) {
      throw this.exceptionsAdapter.notFound({
        message: 'User not found with the provided ID',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    await this.userRepository.adjustUserPoints(userId, {
      allTimePointsDelta: dto.allTimePointsDelta,
      monthlyPointsDelta: dto.monthlyPointsDelta,
    });

    const updatedUser = await this.userRepository.findUserById(userId);
    if (!updatedUser) {
      throw this.exceptionsAdapter.notFound({
        message: 'User not found with the provided ID',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    this.loggerAdapter.log({
      where: 'AdjustUserPointsService',
      message: `Admin ${requester.id} adjusted points of user ${userId}: allTimePointsDelta=${
        dto.allTimePointsDelta ?? 0
      } (${existingUser.allTimePoints} -> ${updatedUser.allTimePoints}), monthlyPointsDelta=${
        dto.monthlyPointsDelta ?? 0
      } (${existingUser.monthlyPoints} -> ${updatedUser.monthlyPoints})`,
    });

    return updatedUser;
  }
}
