import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateRollCallDto {
  @ApiProperty({
    description: 'Data da chamada no formato ISO 8601',
    example: '2026-05-27T14:00:00.000Z',
    type: String,
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
