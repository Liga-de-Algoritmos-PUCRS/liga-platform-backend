import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: 'ID do usuário cuja presença será atualizada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'true para marcar como presente, false para marcar como ausente',
    example: true,
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  isPresent: boolean;
}
