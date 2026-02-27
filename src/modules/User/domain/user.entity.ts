import { createId } from '@paralleldrive/cuid2';

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ROOT = 'ROOT',
}

export interface UserInterface {
  name: string;
  email: string;
  password: string;
  cpf?: string | null;
  phone?: string | null;
  createdAt?: Date;
  role: RoleEnum;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
}

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  cpf: string | null;
  createdAt: Date;
  phone: string | null;
  role: RoleEnum;
  bannerUrl: string | null;
  avatarUrl: string | null;

  constructor(user: UserInterface, id?: string) {
    this.id = id ?? createId();
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.cpf = user.cpf ?? null;
    this.phone = user.phone ?? null;
    this.createdAt = user.createdAt ?? new Date();
    this.bannerUrl = user.bannerUrl ?? null;
    this.avatarUrl = user.avatarUrl ?? null;
    this.role = user.role || RoleEnum.USER;
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      cpf: this.cpf,
      phone: this.phone,
      createdAt: this.createdAt,
      role: this.role,
      bannerUrl: this.bannerUrl,
      avatarUrl: this.avatarUrl,
    };
  }
}
