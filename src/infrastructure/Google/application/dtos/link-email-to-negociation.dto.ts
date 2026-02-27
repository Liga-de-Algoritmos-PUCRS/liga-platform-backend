import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GmailMessageDetailsDTO } from './gmail-message.dto';

export class LinkEmailToNegociationDTO {
  @ApiProperty({ description: 'ID da Negociação', example: 'neg_123' })
  @IsString()
  @IsNotEmpty()
  negociationId: string;

  @ApiProperty({ description: 'ID único do Gmail', example: 'msg_abc123' })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({ type: () => GmailMessageDetailsDTO })
  @ValidateNested()
  @Type(() => GmailMessageDetailsDTO)
  emailData: GmailMessageDetailsDTO;
}
