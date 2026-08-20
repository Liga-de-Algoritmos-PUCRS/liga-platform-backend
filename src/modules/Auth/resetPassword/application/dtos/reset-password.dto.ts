import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty({
    description: 'User email',
    example: 'guilhermecassol@gmail.com',
    required: false,
  })
  @ValidateIf((dto: ResetPasswordDTO) => !dto.tokenId)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({
    description: 'Token id. Deprecated: kept only for backwards compatibility, prefer email.',
    example: 'ivyuuzwcpdbblxmyplhx2tnh',
    required: false,
  })
  @ValidateIf((dto: ResetPasswordDTO) => !dto.email)
  @IsString()
  @IsNotEmpty()
  tokenId?: string;

  @ApiProperty({
    description: 'Indicates if the token has 6 digits',
    example: '123456',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'StrongP@ssw0rd!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export const ResetPasswordDecorator = applyDecorators(
  ApiOperation({
    summary: 'Reset Password',
    description: 'This endpoint allows a user to reset password token.',
  }),
  ApiOkResponse({
    description: 'Password reset successfully.',
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized. The provided credentials are invalid.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
