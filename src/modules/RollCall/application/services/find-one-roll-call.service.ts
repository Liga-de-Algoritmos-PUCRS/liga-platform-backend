import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { RollCall } from '../../domain/roll-call.entity';

export interface RollCallDetail {
  id: string;
  date: Date;
  currentQrCode: string | null;
  qrCodeExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalUsers: number;
  totalPresent: number;
  totalAbsent: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    course?: string;
    semester?: string;
    isPresent: boolean;
  }>;
}

@Injectable()
export class FindOneRollCallService {
  constructor(
    private readonly rollCallRepository: RollCallRepository,
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute(id: string): Promise<RollCallDetail> {
    const rollCall = await this.rollCallRepository.findById(id);
    if (!rollCall) {
      throw this.exceptionsAdapter.notFound({ message: 'Roll call not found' });
    }

    const [presentIds, allUsers] = await Promise.all([
      this.rollCallRepository.findRollCallAttendeeIds(id),
      this.userRepository.getUsers(),
    ]);

    const presentSet = new Set(presentIds);

    return {
      id: rollCall.id,
      date: rollCall.date,
      currentQrCode: rollCall.currentQrCode,
      qrCodeExpiresAt: rollCall.qrCodeExpiresAt,
      createdAt: rollCall.createdAt,
      updatedAt: rollCall.updatedAt,
      totalUsers: allUsers.length,
      totalPresent: presentSet.size,
      totalAbsent: allUsers.length - presentSet.size,
      users: allUsers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          course: user.course,
          semester: user.semester,
          isPresent: presentSet.has(user.id),
        })),
    };
  }
}
