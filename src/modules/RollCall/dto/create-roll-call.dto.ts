import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateRollCallDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
