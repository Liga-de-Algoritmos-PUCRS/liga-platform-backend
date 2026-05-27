import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';

@Injectable()
export class RemoveRollCallService {
  constructor(
    private readonly rollCallRepository: RollCallRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const rollCall = await this.rollCallRepository.findById(id);
    if (!rollCall) {
      throw this.exceptionsAdapter.notFound({ message: 'Roll call not found' });
    }

    await this.rollCallRepository.deleteRollCall(id);
    return { message: 'Roll call deleted successfully' };
  }
}
