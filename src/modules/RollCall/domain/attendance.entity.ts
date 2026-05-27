import { createId } from '@paralleldrive/cuid2';

export interface AttendanceInterface {
  userId: string;
  rollCallId: string;
  createdAt?: Date;
}

export class Attendance {
  id: string;
  userId: string;
  rollCallId: string;
  createdAt: Date;

  constructor(attendance: AttendanceInterface, id?: string) {
    this.id = id ?? createId();
    this.userId = attendance.userId;
    this.rollCallId = attendance.rollCallId;
    this.createdAt = attendance.createdAt ?? new Date();
  }
}
