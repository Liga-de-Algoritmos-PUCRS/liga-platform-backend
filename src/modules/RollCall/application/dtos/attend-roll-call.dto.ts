import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AttendRollCallDto {
  @ApiProperty({
    description: 'UUID do QR Code gerado para a chamada',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  uuid: string;
}
