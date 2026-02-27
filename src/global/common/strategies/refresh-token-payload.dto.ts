import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Role } from "@/modules/User/domain/user.entity";

export class RefreshTokenPayload {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsEnum(["USER", "ADMIN"])
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
