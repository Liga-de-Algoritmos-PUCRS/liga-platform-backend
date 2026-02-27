import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateGoogleEventDTO {
  @ApiProperty({
    description: 'Resumo do evento',
    example: 'Reunião com equipe de vendas',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    description: 'Descrição do evento',
    example: 'Discutir estratégias para o próximo trimestre',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Data e hora de início do evento em formato ISO',
    example: '2023-10-01T10:00:00-03:00',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Data e hora de término do evento em formato ISO',
    example: '2023-10-01T11:00:00-03:00',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Lista de e-mails dos participantes do evento',
    example: '[bekirsch123@gmail.com, cassolzinho123@gmail.com]',
    required: true,
    type: [String],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  attendees: string[];
}
