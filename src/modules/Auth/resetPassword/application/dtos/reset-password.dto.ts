import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty({
    description: 'Token id',
    example: 'ivyuuzwcpdbblxmyplhx2tnh',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  tokenId: string;

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
