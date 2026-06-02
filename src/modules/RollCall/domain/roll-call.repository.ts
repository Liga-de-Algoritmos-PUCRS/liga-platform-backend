import { Injectable } from '@nestjs/common';
import { RollCall } from './roll-call.entity';
import { Attendance } from './attendance.entity';

export type RollCallSummary = { id: string; date: Date; _count: { attendances: number } };

@Injectable()
export abstract class RollCallRepository {
  abstract createRollCall(date: Date): Promise<RollCall>;
  abstract findAllRollCalls(): Promise<RollCallSummary[]>;
  abstract findAllRollCallsSimple(): Promise<RollCall[]>;
  abstract findById(id: string): Promise<RollCall | null>;
  abstract findByQrCode(code: string): Promise<RollCall | null>;
  abstract updateQrCode(id: string, code: string, expiresAt: Date): Promise<RollCall>;
  abstract deleteRollCall(id: string): Promise<void>;
  abstract createAttendance(userId: string, rollCallId: string): Promise<Attendance>;
  abstract findAttendance(userId: string, rollCallId: string): Promise<Attendance | null>;
  abstract upsertAttendance(userId: string, rollCallId: string): Promise<void>;
  abstract deleteAttendance(userId: string, rollCallId: string): Promise<void>;
  abstract findUserAttendances(
    userId: string,
  ): Promise<Array<{ attendance: Attendance; rollCall: RollCall }>>;
  abstract findRollCallAttendeeIds(rollCallId: string): Promise<string[]>;
  abstract findAllAttendances(): Promise<Attendance[]>;
}
