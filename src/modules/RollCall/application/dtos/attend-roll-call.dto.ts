import { IsNotEmpty, IsUUID } from 'class-validator';

export class AttendRollCallDto {
  @IsNotEmpty()
  @IsUUID()
  uuid: string;
}
