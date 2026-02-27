import { Injectable } from "@nestjs/common";
import { User } from "@/modules/User/domain/user.entity";

@Injectable()
export abstract class UserRepository {
  public abstract createUser(user: User): Promise<User>;
  public abstract getUser(id: string): Promise<User | null>;
  public abstract getUsers(): Promise<User[]>;
  public abstract updateUser(user: User): Promise<User>;
  public abstract deleteUser(id: string): Promise<boolean>;
  public abstract findUserById(id: string): Promise<User | null>;
  public abstract findUserByEmail(email: string): Promise<User | null>;
  public abstract findTopUsers(limit: number): Promise<User[]>;
}
