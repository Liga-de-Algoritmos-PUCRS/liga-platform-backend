import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GmailAttachmentDTO {
  @ApiProperty({ description: 'The name of the file', example: 'business_proposal.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'The MIME type of the file', example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'Internal attachment ID in Gmail', example: 'ANGjdJ8...' })
  @IsString()
  attachmentId: string;

  @ApiProperty({ description: 'File size in bytes', example: 204800 })
  @IsNumber()
  size: number;
}

export class GmailHeadersDTO {
  @ApiProperty({ description: 'Subject of the email' })
  @IsString()
  @IsOptional()
  subject: string;

  @ApiProperty({ description: 'Sender' })
  @IsString()
  @IsOptional()
  from: string;

  @ApiProperty({ description: 'Primary recipient' })
  @IsString()
  @IsOptional()
  to?: string;

  @ApiProperty({ description: 'Carbon copy (CC) recipients' })
  @IsString()
  @IsOptional()
  cc?: string; // Adicionado cc

  @ApiProperty({ description: 'Blind carbon copy (BCC) recipients' })
  @IsString()
  @IsOptional()
  bcc?: string; // Adicionado bcc

  @ApiProperty({ description: 'Formatted date of sending/receiving' })
  @IsString()
  @IsOptional()
  date: string;
}

export class GmailMessageDetailsDTO {
  @ApiProperty({ description: 'Unique message ID in Gmail' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'ID of the thread' })
  @IsString()
  @IsOptional()
  threadId: string;

  @ApiProperty({ description: 'Short summary' })
  @IsString()
  @IsOptional()
  snippet: string;

  @ApiProperty({ description: 'Full body content' })
  @IsString()
  @IsOptional()
  body: string;

  // --- Campos que o seu serviço parseEmail envia na raiz do objeto ---
  @ApiProperty({ description: 'Subject at root level' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Sender at root level' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiProperty({ description: 'Date at root level' })
  @IsString()
  @IsOptional()
  date?: string;
  // ------------------------------------------------------------------

  @ApiProperty({ description: 'Is body HTML?' })
  @IsBoolean()
  @IsOptional()
  isHtml: boolean;

  @ApiProperty({ type: () => GmailHeadersDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => GmailHeadersDTO)
  headers: GmailHeadersDTO;

  @ApiProperty({ type: [GmailAttachmentDTO] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GmailAttachmentDTO)
  attachments: GmailAttachmentDTO[];
}
