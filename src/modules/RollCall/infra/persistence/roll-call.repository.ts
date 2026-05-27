import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { RollCallRepository } from '@/modules/RollCall/domain/roll-call.repository';
import { RollCall } from '@/modules/RollCall/domain/roll-call.entity';
import { Attendance } from '@/modules/RollCall/domain/attendance.entity';
import { RollCallMapper } from './roll-call.mapper';
import { AttendanceMapper } from './attendance.mapper';

@Injectable()
export class PrismaRollCallRepository implements RollCallRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerAdapter: LoggerAdapter,
    private readonly exceptionsAdapter: ExceptionsAdapter,
  ) {}

  async createRollCall(date: Date): Promise<RollCall> {
    const created = await this.prisma.rollCall.create({ data: { date } });
    this.loggerAdapter.log({
      where: 'PrismaRollCallRepository.createRollCall',
      message: `Created roll call id=${created.id}`,
    });
    return RollCallMapper.toDomain(created);
  }

  async findAllRollCalls(): Promise<Array<{ rollCall: RollCall; attendanceCount: number }>> {
    const rows = await this.prisma.rollCall.findMany({
      orderBy: { date: 'desc' },
      include: { _count: { select: { attendances: true } } },
    });
    return rows.map((r) => ({
      rollCall: RollCallMapper.toDomain(r),
      attendanceCount: r._count.attendances,
    }));
  }

  async findAllRollCallsSimple(): Promise<RollCall[]> {
    const rows = await this.prisma.rollCall.findMany({ orderBy: { date: 'asc' } });
    return rows.map((r) => RollCallMapper.toDomain(r));
  }

  async findById(id: string): Promise<RollCall | null> {
    const row = await this.prisma.rollCall.findUnique({ where: { id } });
    return row ? RollCallMapper.toDomain(row) : null;
  }

  async findByQrCode(code: string): Promise<RollCall | null> {
    const row = await this.prisma.rollCall.findUnique({ where: { currentQrCode: code } });
    return row ? RollCallMapper.toDomain(row) : null;
  }

  async updateQrCode(id: string, code: string, expiresAt: Date): Promise<RollCall> {
    const updated = await this.prisma.rollCall.update({
      where: { id },
      data: { currentQrCode: code, qrCodeExpiresAt: expiresAt },
    });
    return RollCallMapper.toDomain(updated);
  }

  async deleteRollCall(id: string): Promise<void> {
    await this.prisma.rollCall.delete({ where: { id } });
    this.loggerAdapter.log({
      where: 'PrismaRollCallRepository.deleteRollCall',
      message: `Deleted roll call id=${id}`,
    });
  }

  async createAttendance(userId: string, rollCallId: string): Promise<Attendance> {
    const created = await this.prisma.attendance.create({ data: { userId, rollCallId } });
    return AttendanceMapper.toDomain(created);
  }

  async findAttendance(userId: string, rollCallId: string): Promise<Attendance | null> {
    const row = await this.prisma.attendance.findUnique({
      where: { userRollCall: { userId, rollCallId } },
    });
    return row ? AttendanceMapper.toDomain(row) : null;
  }

  async upsertAttendance(userId: string, rollCallId: string): Promise<void> {
    await this.prisma.attendance.upsert({
      where: { userRollCall: { userId, rollCallId } },
      update: {},
      create: { userId, rollCallId },
    });
  }

  async deleteAttendance(userId: string, rollCallId: string): Promise<void> {
    try {
      await this.prisma.attendance.delete({
        where: { userRollCall: { userId, rollCallId } },
      });
    } catch {
      // attendance did not exist — safe to ignore
    }
  }

  async findUserAttendances(
    userId: string,
  ): Promise<Array<{ attendance: Attendance; rollCall: RollCall }>> {
    const rows = await this.prisma.attendance.findMany({
      where: { userId },
      include: { rollCall: true },
    });
    return rows.map((r) => ({
      attendance: AttendanceMapper.toDomain(r),
      rollCall: RollCallMapper.toDomain(r.rollCall),
    }));
  }

  async findRollCallAttendeeIds(rollCallId: string): Promise<string[]> {
    const rows = await this.prisma.attendance.findMany({
      where: { rollCallId },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  }

  async findAllAttendances(): Promise<Attendance[]> {
    const rows = await this.prisma.attendance.findMany();
    return rows.map((r) => AttendanceMapper.toDomain(r));
  }
}
