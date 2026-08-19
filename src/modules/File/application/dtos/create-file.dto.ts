import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export function ConvertToCreateFileDTO(files: Express.Multer.File): CreateFileHelperDTO {
  const createFileDto = new CreateFileHelperDTO();
  createFileDto.file = files;
  createFileDto.name = files.originalname;
  createFileDto.size = Math.ceil(files.size / (1024 * 1024));
  createFileDto.type = files.mimetype;
  return createFileDto;
}

export class CreateFileHelperDTO {
  @ApiProperty({
    required: true,
    description: 'File (image/jpeg, image/png, image/gif, image/webp)',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  file: Express.Multer.File;

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
  @IsOptional()
  negociationId: string;
}
