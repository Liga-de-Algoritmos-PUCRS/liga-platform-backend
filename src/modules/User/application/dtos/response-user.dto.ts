import { AccountStatus, AccountTier } from '@/modules/User/domain/user.repository';
import { ApiProperty } from '@nestjs/swagger';
import { UserWithAccountInformationsResponse } from '@/modules/User/domain/user.repository';
import { RoleEnum } from '@/modules/User/domain/user.entity';

export abstract class UserResponseDTO {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'Guilherme Cassol',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'guilhemecassol@gmail.com',
    required: true,
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User CPF',
    example: '12345678901',
    required: false,
    type: String,
    nullable: true,
  })
  cpf: string | null;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-10-05T14:48:00.000Z',
    required: true,
    type: Date,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User phone',
    example: '51999332029',
    required: false,
    type: String,
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'User role',
    example: RoleEnum.USER,
    required: true,
    enum: RoleEnum,
  })
  role: RoleEnum;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    type: String,
    nullable: true,
  })
  avatarUrl: string | null; // Adicione aqui

  @ApiProperty({
    description: 'User banner URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    type: String,
    nullable: true,
  })
  bannerUrl: string | null; // Adicione aqui
}

export abstract class CreateUserWithAccountResponseDTO
  extends UserResponseDTO
  implements UserWithAccountInformationsResponse
{
  @ApiProperty({
    description: 'Workspace ID',
    example: 'workspace_123e4567-e89b-12d3-a456-426614174000',
    required: true,
    type: String,
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Account status',
    example: 'ACTIVE',
    required: true,
    enum: ['ACTIVE', 'EXPIRED', 'INACTIVE', 'REVOKED'],
  })
  accountStatus: AccountStatus;

  @ApiProperty({
    description: 'Account tier',
    example: 'FREE',
    required: true,
    enum: ['FREE', 'PAYMENT'],
  })
  accountTier: AccountTier;
}
