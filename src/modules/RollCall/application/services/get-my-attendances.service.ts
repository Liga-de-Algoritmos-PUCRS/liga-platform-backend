import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { RollCall } from '../../domain/roll-call.entity';

export interface MyAttendancesResult {
  totalClasses: number;
  totalAttendances: number;
  totalMisses: number;
  history: Array<RollCall & { isPresent: boolean }>;
}

@Injectable()
export class GetMyAttendancesService {
  constructor(private readonly rollCallRepository: RollCallRepository) {}

  async execute(userId: string): Promise<MyAttendancesResult> {
    const [userAttendances, allRollCalls] = await Promise.all([
      this.rollCallRepository.findUserAttendances(userId),
      this.rollCallRepository.findAllRollCallsSimple(),
    ]);

    const attendedIds = new Set(userAttendances.map((a) => a.rollCall.id));

    const history = allRollCalls.map((rc) => ({
      ...rc,
      isPresent: attendedIds.has(rc.id),
    }));

    return {
      totalClasses: allRollCalls.length,
      totalAttendances: attendedIds.size,
      totalMisses: allRollCalls.length - attendedIds.size,
      history,
    };
  }
}
