import { Injectable } from '@nestjs/common';
import { User } from '@/modules/User/domain/user.entity';
import { UserMapper } from '@/modules/User/infra/persistence/user.mapper';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {}

  public async createUser(user: User): Promise<User> {
    try {
      const userToPersiste = UserMapper.toPersistence(user);

      const createdUser = await this.prisma.user.create({
        data: userToPersiste,
      });

      if (createdUser) {
        this.LoggerAdapter.log({
          where: 'UserRepository.CreateUser',
          message: `New user in database: ${JSON.stringify(createdUser)}`,
        });

        return UserMapper.toDomain(createdUser);
      } else {
        throw this.ExceptionsAdapter.internalServerError({
          message: `[user.repository].createUser --> User was not created in database under email: ${user.email}`,
        });
      }
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `[user.repository].createUser --> User was not created in database under email: ${user.email} | errorText: ${error}`,
      });
    }
  }

  public async getUser(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  public async getUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => UserMapper.toDomain(user));
  }

  public async updateUser(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: data,
    });

    return UserMapper.toDomain(updatedUser);
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'PrismaUserRepository',
        message: `Error deleting user with ID: ${id}. Error: ${error}`,
      });
      return false;
    }
  }

  public async findUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  public async findMonthlyTopUsers(limit: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        monthlyPoints: 'desc',
      },
      take: limit,
    });

    return users.map((user) => UserMapper.toDomain(user));
  }

  public async findAllTimeTopUsers(limit: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        allPoints: 'desc',
      },
      take: limit,
    });

    return users.map((user) => UserMapper.toDomain(user));
  }

  public async incrementUserPoints(userId: string, points: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monthlyPoints: {
          increment: points,
        },
        allPoints: {
          increment: points,
        },
      },
    });
  }

  public async resetAllMonthlyPoints(): Promise<void> {
    this.LoggerAdapter.log({
      where: 'PrismaUserRepository',
      message: `Resetting monthly points for all users`,
    });
    await this.prisma.user.updateMany({
      data: {
        monthlyPoints: 0,
      },
    });
  }
}
