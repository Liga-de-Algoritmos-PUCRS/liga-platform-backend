import { Injectable } from '@nestjs/common';
import { User } from '@/modules/User/domain/user.entity';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

@Injectable()
export abstract class UserRepository {
  public abstract createUser(user: User, tx?: Transaction): Promise<User>;
  public abstract getUser(id: string): Promise<User | null>;
  public abstract getUsers(): Promise<User[]>;
  public abstract updateUser(user: User): Promise<User>;
  public abstract deleteUser(id: string): Promise<boolean>;
  public abstract findUserById(id: string): Promise<User | null>;
  public abstract findUserByEmail(email: string): Promise<User | null>;
  public abstract findAllTimeTopUsers(limit: number): Promise<User[]>;
  public abstract findMonthlyTopUsers(limit: number): Promise<User[]>;
  public abstract incrementUserPoints(
    userId: string,
    points: number,
    tx?: Transaction,
  ): Promise<void>;
  public abstract decrementUserPoints(
    userId: string,
    points: number,
    tx?: Transaction,
  ): Promise<void>;
  public abstract resetAllMonthlyPoints(): Promise<void>;
  public abstract adjustUserPoints(
    userId: string,
    delta: { allTimePointsDelta?: number; monthlyPointsDelta?: number },
  ): Promise<void>;
  public abstract incrementUserSubmissions(userId: string, tx?: Transaction): Promise<void>;
  public abstract incrementUserProblemsResolved(userId: string, tx?: Transaction): Promise<void>;
  public abstract decrementUserProblemsResolved(userId: string, tx?: Transaction): Promise<void>;
}
