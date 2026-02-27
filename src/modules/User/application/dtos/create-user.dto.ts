import { RoleEnum } from '@/modules/User/domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  Length,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({
    description: 'User name',
    example: 'Guilherme Cassol',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'guilhermecassol@gmail.com',
    required: true,
    type: String,
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Cassolzinho123*',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User CPF',
    example: '12345678901',
    required: true,
    type: String,
  })
  @IsNumberString()
  @IsOptional()
  @Length(11, 11)
  cpf?: string;

  @ApiProperty({
    description: 'User phone',
    example: '51999332029',
    required: true,
    type: String,
  })
  @IsOptional()
  @IsNumberString()
  @Length(11, 11)
  phone?: string;

  @ApiProperty({
    description: 'User role',
    example: RoleEnum.USER,
    required: true,
    enum: RoleEnum,
    type: String,
  })
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role: RoleEnum;
}
