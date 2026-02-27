import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendGmailMessageDTO {
  @ApiProperty({
    description: 'Email do destinatário',
    example: 'bekirsch123@gmail.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Assunto do email',
    example: 'Assunto do email',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Corpo do email',
    example: 'Corpo do email',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'ID da mensagem para resposta',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  replyToMessageId?: string;
}

export class SendGmailMessageResponseDTO {
  @ApiProperty({
    description: 'ID da mensagem',
    example: '1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'ID da thread',
    example: '1234567890',
  })
  threadId: string;

  @ApiProperty({
    description: 'Labels da mensagem',
    example: ['INBOX'],
  })
  labelIds?: string[];
}
