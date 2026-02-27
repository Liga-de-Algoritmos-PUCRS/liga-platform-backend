import { AccountStatus, AccountTier } from '@/modules/Account/domain/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAccountDTO {
  @ApiProperty({
    description: 'Account status',
    example: 'ACTIVE',
  })
  @IsNotEmpty()
  @Type(() => String)
  status: AccountStatus;

  @ApiProperty({
    description: 'Workspace ID',
    example: 'workspace_12345',
  })
  @IsNotEmpty()
  @Type(() => String)
  workspaceId: string;

  @ApiProperty({
    description: 'Account tier',
    example: 'Free',
    required: false,
  })
  @IsOptional()
  accountTier: AccountTier;
}
