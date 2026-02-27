import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDriveWatchDTO {
  @ApiProperty({
    description: 'ID da pasta do Google Drive a ser monitorada',
    example: '1A2B3C4D5E6F7G8H9I0J',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  folderId: string;
}
