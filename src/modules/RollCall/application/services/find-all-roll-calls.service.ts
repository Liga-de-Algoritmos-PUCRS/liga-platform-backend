import { Injectable } from '@nestjs/common';
import { RollCallRepository, RollCallSummary } from '../../domain/roll-call.repository';

@Injectable()
export class FindAllRollCallsService {
  constructor(private readonly rollCallRepository: RollCallRepository) {}

  async execute(): Promise<RollCallSummary[]> {
    return this.rollCallRepository.findAllRollCalls();
  }
}
