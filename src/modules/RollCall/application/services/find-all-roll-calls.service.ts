import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { RollCall } from '../../domain/roll-call.entity';

@Injectable()
export class FindAllRollCallsService {
  constructor(private readonly rollCallRepository: RollCallRepository) {}

  async execute(): Promise<Array<{ rollCall: RollCall; attendanceCount: number }>> {
    return this.rollCallRepository.findAllRollCalls();
  }
}
