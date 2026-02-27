import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '@/modules/User/domain/user.entity';
import { UpdateUserDTO } from '@/modules/User/application/dtos/update-user.dto';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';
@Injectable()
export class UpdateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute(id: string, updatedUser: UpdateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findUserById(id);
    if (!existingUser) {
      throw this.exceptionsAdapter.notFound({
        message: 'User not found with the provided ID',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    existingUser.name = updatedUser.name ?? existingUser.name;
    existingUser.bannerUrl = updatedUser.bannerUrl ?? existingUser.bannerUrl;
    existingUser.avatarUrl = updatedUser.avatarUrl ?? existingUser.avatarUrl;
    existingUser.course = updatedUser.course ?? existingUser.course;
    existingUser.semester = updatedUser.semester ?? existingUser.semester;

    return await this.userRepository.updateUser(existingUser);
  }
}
