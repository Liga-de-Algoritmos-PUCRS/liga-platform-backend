import { RollCall as PrismaRollCall } from '@prisma/client';
import { RollCall } from '@/modules/RollCall/domain/roll-call.entity';

export class RollCallMapper {
  static toDomain(prismaRollCall: PrismaRollCall): RollCall {
    return new RollCall(
      {
        date: prismaRollCall.date,
        currentQrCode: prismaRollCall.currentQrCode ?? undefined,
        qrCodeExpiresAt: prismaRollCall.qrCodeExpiresAt ?? undefined,
        createdAt: prismaRollCall.createdAt,
        updatedAt: prismaRollCall.updatedAt,
      },
      prismaRollCall.id,
    );
  }

  static toPersistence(rollCall: RollCall): PrismaRollCall {
    return {
      id: rollCall.id,
      date: rollCall.date,
      currentQrCode: rollCall.currentQrCode ?? null,
      qrCodeExpiresAt: rollCall.qrCodeExpiresAt ?? null,
      createdAt: rollCall.createdAt,
      updatedAt: rollCall.updatedAt,
    };
  }
}
