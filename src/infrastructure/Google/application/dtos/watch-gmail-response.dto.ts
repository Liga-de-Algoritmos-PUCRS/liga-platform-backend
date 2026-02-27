import { ApiProperty } from '@nestjs/swagger';

export class WatchGmailInboxResponseDTO {
  @ApiProperty({
    description:
      "The ID of the mailbox's current history record. This ID is used to fetch subsequent changes.",
    example: '123456789',
  })
  historyId: string;

  @ApiProperty({
    description:
      'Timestamp (in milliseconds) when the push notification subscription expires. You must renew the watch before this time.',
    example: '1643657890000',
  })
  expiration: string;
}
