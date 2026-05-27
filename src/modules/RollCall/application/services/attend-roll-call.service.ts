import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';

export interface AttendRollCallInput {
  userId: string;
  qrCode: string;
}

@Injectable()
export class AttendRollCallService {
  constructor(
    private readonly rollCallRepository: RollCallRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute({ userId, qrCode }: AttendRollCallInput): Promise<{ message: string }> {
    const rollCall = await this.rollCallRepository.findByQrCode(qrCode);

    if (!rollCall) {
      throw this.exceptionsAdapter.badRequest({ message: 'Invalid or expired QR Code' });
    }

    if (rollCall.qrCodeExpiresAt && rollCall.qrCodeExpiresAt < new Date()) {
      throw this.exceptionsAdapter.badRequest({ message: 'QR Code has expired' });
    }

    const existing = await this.rollCallRepository.findAttendance(userId, rollCall.id);
    if (existing) {
      return { message: 'Attendance already registered' };
    }

    await this.rollCallRepository.createAttendance(userId, rollCall.id);
    return { message: 'Attendance registered successfully' };
  }
}
