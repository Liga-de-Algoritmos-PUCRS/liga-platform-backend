import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';

export interface MyAttendancesResult {
  totalClasses: number;
  totalAttendances: number;
  totalMisses: number;
  history: Array<{ rollCallId: string; date: Date; isPresent: boolean }>;
}

@Injectable()
export class GetMyAttendancesService {
  constructor(private readonly rollCallRepository: RollCallRepository) {}

  async execute(userId: string): Promise<MyAttendancesResult> {
    const [attendedRollCallIds, allRollCalls] = await Promise.all([
      this.rollCallRepository.findAttendedRollCallIds(userId),
      this.rollCallRepository.findAllRollCallsSimple(),
    ]);

    const attendedIds = new Set(attendedRollCallIds);

    const history = allRollCalls.map((rc) => ({
      ...rc.toPublicJSON(),
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
