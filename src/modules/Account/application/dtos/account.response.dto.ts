import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus, AccountTier } from '@/modules/Account/domain/account.entity';

export class AccountResponseDTO {
  @ApiProperty({
    description: 'Unique identifier for the account',
    example: 'account_12345',
    type: String,
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Workspace ID associated with the account',
    example: 'workspace_12345',
    type: String,
    required: true,
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Current status of the account',
    example: 'ACTIVE',
    type: String,
    required: true,
    enum: ['ACTIVE', 'EXPIRED', 'INACTIVE', 'REVOKED'],
  })
  status: AccountStatus;

  @ApiProperty({
    description: 'Tier of the account',
    example: 'FREE',
    type: String,
    required: true,
    enum: ['FREE', 'PAYMENT'],
  })
  accountTier: AccountTier;
}
