import { Attendance as PrismaAttendance } from '@prisma/client';
import { Attendance } from '@/modules/RollCall/domain/attendance.entity';

export class AttendanceMapper {
  static toDomain(prismaAttendance: PrismaAttendance): Attendance {
    return new Attendance(
      {
        userId: prismaAttendance.userId,
        rollCallId: prismaAttendance.rollCallId,
        createdAt: prismaAttendance.createdAt,
      },
      prismaAttendance.id,
    );
  }
}
