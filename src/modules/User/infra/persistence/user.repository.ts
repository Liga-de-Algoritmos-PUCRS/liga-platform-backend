import { Injectable } from '@nestjs/common';
import { User } from '@/modules/User/domain/user.entity';
import { UserMapper } from '@/modules/User/infra/persistence/user.mapper';
import { UserRepository } from '@/modules/User/domain/user.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';
import { sanitizeForLog } from '@/infrastructure/Logger/utils/sanitize-log.util';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {}

  public async createUser(user: User, tx?: Transaction): Promise<User> {
    try {
      const client = tx ?? this.prisma;
      const userToPersiste = UserMapper.toPersistence(user);

      const createdUser = await client.user.create({
        data: userToPersiste,
      });

      if (createdUser) {
        this.LoggerAdapter.log({
          where: 'UserRepository.CreateUser',
          message: `New user in database: ${JSON.stringify(sanitizeForLog(createdUser))}`,
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

  public async incrementUserPoints(
    userId: string,
    points: number,
    tx?: Transaction,
  ): Promise<void> {
    // Sem o `tx`, o update roda no client base e fica de fora da transacao de
    // quem chamou -- vale para todos os metodos daqui que recebem `tx`.
    const client = tx ?? this.prisma;
    await client.user.update({
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

  public async decrementUserPoints(
    userId: string,
    points: number,
    tx?: Transaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    // O mensal leva `GREATEST` e o total nao: `POST /user/reset-points` zera
    // so o mensal, entao desfazer um acerto feito antes do reset tiraria
    // pontos que ja nao estao mais la e deixaria o ranking mensal negativo --
    // e nao existe pontuacao negativa no modelo competitivo. O `all_points`
    // nunca e zerado, entao o que foi creditado sempre esta la para tirar.
    await client.$executeRaw`
      UPDATE "users"
      SET "all_points" = "all_points" - ${points},
          "monthly_points" = GREATEST(0, "monthly_points" - ${points})
      WHERE "id" = ${userId}`;
  }

  public async adjustUserPoints(
    userId: string,
    delta: { allTimePointsDelta?: number; monthlyPointsDelta?: number },
  ): Promise<void> {
    const allTimePointsDelta = delta.allTimePointsDelta ?? 0;
    const monthlyPointsDelta = delta.monthlyPointsDelta ?? 0;

    await this.prisma.$executeRaw`
      UPDATE "users"
      SET "all_points" = GREATEST(0, "all_points" + ${allTimePointsDelta}),
          "monthly_points" = GREATEST(0, "monthly_points" + ${monthlyPointsDelta})
      WHERE "id" = ${userId}`;
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

  public async incrementUserSubmissions(userId: string, tx?: Transaction): Promise<void> {
    const client = tx ?? this.prisma;
    await client.user.update({
      where: { id: userId },
      data: {
        submissionsNumber: {
          increment: 1,
        },
      },
    });
  }

  public async incrementUserProblemsResolved(userId: string, tx?: Transaction): Promise<void> {
    const client = tx ?? this.prisma;
    await client.user.update({
      where: { id: userId },
      data: {
        problemsResolved: {
          increment: 1,
        },
      },
    });
  }

  public async decrementUserProblemsResolved(userId: string, tx?: Transaction): Promise<void> {
    const client = tx ?? this.prisma;
    await client.user.update({
      where: { id: userId },
      data: {
        problemsResolved: {
          decrement: 1,
        },
      },
    });
  }
}
