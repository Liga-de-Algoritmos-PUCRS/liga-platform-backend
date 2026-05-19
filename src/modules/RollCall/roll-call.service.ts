import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { CreateRollCallDto } from './dto/create-roll-call.dto';
import { AttendRollCallDto } from './dto/attend-roll-call.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class RollCallService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRollCallDto: CreateRollCallDto) {
    return this.prisma.rollCall.create({
      data: {
        date: new Date(createRollCallDto.date),
      },
    });
  }

  async findAll() {
    return this.prisma.rollCall.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const rollCall = await this.prisma.rollCall.findUnique({
      where: { id },
      include: {
        attendances: {
          select: { userId: true },
        },
      },
    });

    if (!rollCall) {
      throw new NotFoundException('Roll call not found');
    }

    const allUsers = await this.prisma.user.findMany({
      select: { id: true, name: true, email: true, avatarUrl: true, course: true, semester: true },
      orderBy: { name: 'asc' },
    });

    const presentUserIds = new Set(rollCall.attendances.map((a) => a.userId));

    const { attendances: _, ...rollCallData } = rollCall;

    return {
      ...rollCallData,
      totalUsers: allUsers.length,
      totalPresent: presentUserIds.size,
      totalAbsent: allUsers.length - presentUserIds.size,
      users: allUsers.map((user) => ({
        ...user,
        isPresent: presentUserIds.has(user.id),
      })),
    };
  }

  async generateQrCode(id: string) {
    const rollCall = await this.prisma.rollCall.findUnique({ where: { id } });
    if (!rollCall) {
      throw new NotFoundException('Roll call not found');
    }

    const uuid = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 1000); // 15 seconds from now

    return this.prisma.rollCall.update({
      where: { id },
      data: {
        currentQrCode: uuid,
        qrCodeExpiresAt: expiresAt,
      },
      select: {
        id: true,
        currentQrCode: true,
        qrCodeExpiresAt: true,
      },
    });
  }

  async attend(userId: string, attendRollCallDto: AttendRollCallDto) {
    const rollCall = await this.prisma.rollCall.findUnique({
      where: { currentQrCode: attendRollCallDto.uuid },
    });

    if (!rollCall) {
      throw new BadRequestException('Invalid or expired QR Code');
    }

    if (rollCall.qrCodeExpiresAt && rollCall.qrCodeExpiresAt < new Date()) {
      throw new BadRequestException('QR Code has expired');
    }

    // Check if user already attended
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        userId_rollCallId: {
          userId,
          rollCallId: rollCall.id,
        },
      },
    });

    if (existingAttendance) {
      return { message: 'Attendance already registered' };
    }

    await this.prisma.attendance.create({
      data: {
        userId,
        rollCallId: rollCall.id,
      },
    });

    return { message: 'Attendance registered successfully' };
  }

  async updateAttendance(rollCallId: string, updateAttendanceDto: UpdateAttendanceDto) {
    const { userId, isPresent } = updateAttendanceDto;

    const rollCall = await this.prisma.rollCall.findUnique({ where: { id: rollCallId } });
    if (!rollCall) {
      throw new NotFoundException('Roll call not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (isPresent) {
      await this.prisma.attendance.upsert({
        where: {
          userId_rollCallId: {
            userId,
            rollCallId,
          },
        },
        update: {},
        create: {
          userId,
          rollCallId,
        },
      });
      return { message: 'Attendance added' };
    } else {
      try {
        await this.prisma.attendance.delete({
          where: {
            userId_rollCallId: {
              userId,
              rollCallId,
            },
          },
        });
      } catch (error) {
        // Ignore if not found
      }
      return { message: 'Attendance removed' };
    }
  }

  async getMyAttendances(userId: string) {
    const attendances = await this.prisma.attendance.findMany({
      where: { userId },
      include: {
        rollCall: true,
      },
    });

    const allRollCalls = await this.prisma.rollCall.findMany({
      orderBy: { date: 'asc' },
    });

    const attendedRollCallIds = new Set(attendances.map((a) => a.rollCallId));

    const history = allRollCalls.map((rc) => ({
      ...rc,
      isPresent: attendedRollCallIds.has(rc.id),
    }));

    const totalClasses = allRollCalls.length;
    const totalAttendances = attendances.length;
    const totalMisses = totalClasses - totalAttendances;

    return {
      totalClasses,
      totalAttendances,
      totalMisses,
      history,
    };
  }

  async getOverview() {
    const [users, allRollCalls] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          course: true,
          semester: true,
          attendances: {
            select: { rollCallId: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.rollCall.findMany({
        orderBy: { date: 'asc' },
        select: { id: true, date: true },
      }),
    ]);

    const totalClasses = allRollCalls.length;

    return {
      totalClasses,
      users: users.map((user) => {
        const attendedIds = new Set(user.attendances.map((a) => a.rollCallId));
        const totalAttendances = attendedIds.size;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          course: user.course,
          semester: user.semester,
          totalAttendances,
          totalMisses: totalClasses - totalAttendances,
          totalClasses,
          attendanceRate:
            totalClasses > 0 ? Math.round((totalAttendances / totalClasses) * 100) : 0,
          history: allRollCalls.map((rc) => ({
            rollCallId: rc.id,
            date: rc.date,
            isPresent: attendedIds.has(rc.id),
          })),
        };
      }),
    };
  }

  async remove(id: string) {
    const rollCall = await this.prisma.rollCall.findUnique({ where: { id } });
    if (!rollCall) {
      throw new NotFoundException('Roll call not found');
    }

    await this.prisma.rollCall.delete({
      where: { id },
    });

    return { message: 'Roll call deleted successfully' };
  }
}

