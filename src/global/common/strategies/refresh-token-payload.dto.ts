import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from '@/modules/User/domain/user.entity';

export class RefreshTokenPayload {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsString()
  @IsOptional()
  jti?: string;

  @IsEnum(['USER', 'ADMIN'])
  @IsNotEmpty()
  userRole: Role;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsNumber()
  @IsNotEmpty()
  iat: number;

  @IsNumber()
  @IsNotEmpty()
  exp: number;
}
