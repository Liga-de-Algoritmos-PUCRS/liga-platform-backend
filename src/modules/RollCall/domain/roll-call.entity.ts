import { createId } from '@paralleldrive/cuid2';

export interface RollCallInterface {
  date: Date;
  currentQrCode?: string | null;
  qrCodeExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RollCall {
  id: string;
  date: Date;
  currentQrCode: string | null;
  qrCodeExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(rollCall: RollCallInterface, id?: string) {
    this.id = id ?? createId();
    this.date = rollCall.date;
    this.currentQrCode = rollCall.currentQrCode ?? null;
    this.qrCodeExpiresAt = rollCall.qrCodeExpiresAt ?? null;
    this.createdAt = rollCall.createdAt ?? new Date();
    this.updatedAt = rollCall.updatedAt ?? new Date();
  }
}
