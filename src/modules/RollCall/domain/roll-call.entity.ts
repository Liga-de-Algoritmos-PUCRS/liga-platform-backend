import { createId } from '@paralleldrive/cuid2';
import { User } from '@/modules/User/domain/user.entity';

export interface RollCallInterface {
  date: Date;
  currentQrCode?: string;
  qrCodeExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RollCall {
  id: string;
  date: Date;
  currentQrCode?: string;
  qrCodeExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(rollCall: RollCallInterface, id?: string) {
    this.id = id ?? createId();
    this.date = rollCall.date;
    this.currentQrCode = rollCall.currentQrCode;
    this.qrCodeExpiresAt = rollCall.qrCodeExpiresAt;
    this.createdAt = rollCall.createdAt ?? new Date();
    this.updatedAt = rollCall.updatedAt ?? new Date();
  }

  // Nome do campo é `rollCallId`, não `id`, para bater com o que o front já lê
  // e com o `history` de get-overview.service.ts.
  toPublicJSON(): { rollCallId: string; date: Date } {
    return {
      rollCallId: this.id,
      date: this.date,
    };
  }
}

export interface RollCallDetail {
  id: string;
  date: Date;
  currentQrCode?: string;
  qrCodeExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalUsers: number;
  totalPresent: number;
  totalAbsent: number;
  users: Array<ReturnType<User['toJSON']> & { isPresent: boolean }>;
}
