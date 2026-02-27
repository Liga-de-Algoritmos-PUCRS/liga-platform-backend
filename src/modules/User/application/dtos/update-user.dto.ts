import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@/modules/User/domain/user.entity';
import { IsEnum, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty({
    description: 'User name',
    example: 'Guilherme Cassol',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User CPF',
    example: '12345678901',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsNumberString()
  @Length(11, 11)
  cpf?: string;

  @ApiProperty({
    description: 'User phone',
    example: '51999332029',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsNumberString()
  @Length(11, 11)
  phone?: string;

  @ApiProperty({
    description: 'User role',
    example: RoleEnum.USER,
    required: false,
    enum: RoleEnum,
  })
  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @ApiProperty({
    description: 'User banner URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
