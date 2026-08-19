import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { RollCall } from '../../domain/roll-call.entity';

const QR_CODE_TTL_SECONDS = 30;

@Injectable()
export class GenerateQrCodeService {
  constructor(
    private readonly rollCallRepository: RollCallRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute(id: string): Promise<RollCall> {
    const rollCall = await this.rollCallRepository.findById(id);
    if (!rollCall) {
      throw this.exceptionsAdapter.notFound({ message: 'Roll call not found' });
    }

    const code = randomUUID();
    const expiresAt = new Date(Date.now() + QR_CODE_TTL_SECONDS * 1000);

    return this.rollCallRepository.updateQrCode(id, code, expiresAt);
  }
}
