import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import {
  RollCallRepository,
  RollCallSummary,
} from '@/modules/RollCall/domain/roll-call.repository';
import { RollCall } from '@/modules/RollCall/domain/roll-call.entity';
import { Attendance } from '@/modules/RollCall/domain/attendance.entity';
import { RollCallMapper } from './roll-call.mapper';
import { AttendanceMapper } from './attendance.mapper';

@Injectable()
export class PrismaRollCallRepository implements RollCallRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerAdapter: LoggerAdapter,
  ) {}

  async createRollCall(date: Date): Promise<RollCall> {
    const created = await this.prisma.rollCall.create({ data: { date } });
    this.loggerAdapter.log({
      where: 'PrismaRollCallRepository.createRollCall',
      message: `Created roll call id=${created.id}`,
    });
    return RollCallMapper.toDomain(created);
  }

  async findAllRollCalls(): Promise<RollCallSummary[]> {
    const rows = await this.prisma.rollCall.findMany({
      orderBy: { date: 'desc' },
      include: { _count: { select: { attendances: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      _count: { attendances: r._count.attendances },
    }));
  }

  async findAllRollCallsSimple(): Promise<RollCall[]> {
    const rows = await this.prisma.rollCall.findMany({
      orderBy: { date: 'asc' },
      select: { id: true, date: true, createdAt: true, updatedAt: true },
    });
    return rows.map((r) => RollCallMapper.toDomainWithoutQrCode(r));
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
    await this.prisma.attendance.deleteMany({
      where: { userId, rollCallId },
    });
  }

  async findAttendedRollCallIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.attendance.findMany({
      where: { userId },
      select: { rollCallId: true },
    });
    return rows.map((r) => r.rollCallId);
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
