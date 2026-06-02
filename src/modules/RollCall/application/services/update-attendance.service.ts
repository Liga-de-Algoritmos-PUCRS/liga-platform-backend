import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';

export interface UpdateAttendanceInput {
  rollCallId: string;
  userId: string;
  isPresent: boolean;
}

@Injectable()
export class UpdateAttendanceService {
  constructor(
    private readonly rollCallRepository: RollCallRepository,
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute({
    rollCallId,
    userId,
    isPresent,
  }: UpdateAttendanceInput): Promise<{ message: string }> {
    const [rollCall, user] = await Promise.all([
      this.rollCallRepository.findById(rollCallId),
      this.userRepository.findUserById(userId),
    ]);

    if (!rollCall) {
      throw this.exceptionsAdapter.notFound({ message: 'Roll call not found' });
    }
    if (!user) {
      throw this.exceptionsAdapter.notFound({ message: 'User not found' });
    }

    if (isPresent) {
      await this.rollCallRepository.upsertAttendance(userId, rollCallId);
      return { message: 'Attendance added' };
    }

    await this.rollCallRepository.deleteAttendance(userId, rollCallId);
    return { message: 'Attendance removed' };
  }
}
