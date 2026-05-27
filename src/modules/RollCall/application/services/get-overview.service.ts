import { Injectable } from '@nestjs/common';
import { RollCallRepository } from '../../domain/roll-call.repository';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class GetOverviewService {
  constructor(
    private readonly rollCallRepository: RollCallRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute() {
    const [users, allRollCalls, allAttendances] = await Promise.all([
      this.userRepository.getUsers(),
      this.rollCallRepository.findAllRollCallsSimple(),
      this.rollCallRepository.findAllAttendances(),
    ]);

    const totalClasses = allRollCalls.length;

    const attendancesByUser = new Map<string, Set<string>>();
    for (const attendance of allAttendances) {
      if (!attendancesByUser.has(attendance.userId)) {
        attendancesByUser.set(attendance.userId, new Set());
      }
      attendancesByUser.get(attendance.userId)!.add(attendance.rollCallId);
    }

    return {
      totalClasses,
      users: users
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => {
          const attendedIds = attendancesByUser.get(user.id) ?? new Set<string>();
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
}
