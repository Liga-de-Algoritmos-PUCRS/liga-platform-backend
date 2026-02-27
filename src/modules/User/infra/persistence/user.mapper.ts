import { User, Role, Semester, Course } from '@/modules/User/domain/user.entity';
import { User as PrismaUser, RoleEnum as PrismaRole } from '@prisma/client';

export class UserMapper {
  static toDomain(user: PrismaUser): User {
    const model = new User(
      {
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        role: user.role as Role,
        bannerUrl: user.bannerUrl,
        avatarUrl: user.avatarUrl,
        monthlyPoints: user.monthlyPoints,
        allTimePoints: user.allPoints,
        historycalSubmissions: user.historicalSubmissions,
        semester: user.semester as Semester,
        course: user.course as Course,
      },
      user.id,
    );
    return model;
  }

  static toPersistence(user: User): PrismaUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      role: user.role as PrismaRole,
      bannerUrl: user.bannerUrl,
      avatarUrl: user.avatarUrl,
      monthlyPoints: user.monthlyPoints ?? 0,
      allPoints: user.allTimePoints ?? 0,
      historicalSubmissions: user.historycalSubmissions ?? 0,
      course: user.course ?? null,
      semester: user.semester ?? null,
    };
  }
}
