import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFileByN8NRequestDTO {
  @ApiProperty({
    description: 'Author ID',
    example: '1234567890abcdef12345678',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ApiProperty({
    description: 'File URL',
    example:
      'https://storage.googleapis.com/bee-crm-backend/files/1234567890abcdef12345678/relatorio_mensal.xlsx',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'File name',
    example: 'relatorio_mensal.xlsx',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'File size in mb',
    example: 34000,
    required: true,
  })
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    description: 'File type',
    example: '.pdf',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Negociation ID',
    example: '1234567890abcdef12345678',
    required: true,
  })
  @IsString()
  negociationId: string;
}
