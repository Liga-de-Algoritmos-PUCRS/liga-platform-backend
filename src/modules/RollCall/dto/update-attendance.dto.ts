import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsBoolean()
  isPresent: boolean;
}
