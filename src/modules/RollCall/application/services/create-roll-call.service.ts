import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { RollCall } from '../../domain/roll-call.entity';

@Injectable()
export class CreateRollCallService {
  constructor(private readonly rollCallRepository: RollCallRepository) {}

  async execute(date: Date): Promise<RollCall> {
    return this.rollCallRepository.createRollCall(date);
  }
}
