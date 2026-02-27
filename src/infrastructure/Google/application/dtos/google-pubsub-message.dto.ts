import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PubSubMessageDataDTO {
  @ApiProperty({
    description: 'The actual data payload (Base64 encoded JSON)',
    example: 'eyJlbWFpbEFkZHJlc3MiOiAidXNlckBleGFtcGxlLmNvbSIsICJoaXN0b3J5SWQiOiAxMjM0NTY3ODl9',
  })
  @IsString()
  data: string;

  @ApiProperty({
    description: 'Unique ID of the message',
    example: '1234567890',
  })
  @IsString()
  messageId: string;

  @ApiProperty({
    description: 'Time when the message was published',
    example: '2026-02-10T12:00:00.000Z',
  })
  @IsString()
  publishTime: string;
}

export class GooglePubSubMessageDTO {
  @ApiProperty({
    description: 'The message object containing the actual notification data',
    type: () => PubSubMessageDataDTO,
  })
  @ValidateNested()
  @Type(() => PubSubMessageDataDTO)
  message: PubSubMessageDataDTO;

  @ApiProperty({
    description: 'The name of the subscription that pushed this message',
    example: 'projects/my-project/subscriptions/my-gmail-subscription',
  })
  @IsString()
  subscription: string;
}
