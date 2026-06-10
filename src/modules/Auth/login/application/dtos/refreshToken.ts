import { Role } from '@/modules/User/domain/user.entity';

export interface TokensResponseInterface {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseInterface extends TokensResponseInterface {
  userId: string;
}

export interface TokenParams {
  accountId: string;
  userRole: Role;
}
