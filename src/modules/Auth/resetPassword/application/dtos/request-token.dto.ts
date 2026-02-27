import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export class ResetPasswordRequestDTO {
  @ApiProperty({
    description: 'User email',
    example: 'guilhermecassol@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordRequestResponseDTO {
  @ApiProperty({
    description: 'Reset Password Token ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Token expiration date and time',
    example: '2024-12-31T23:59:59.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Indicates whether the token has been revoked',
    example: false,
  })
  isRevoked: boolean;
}

export const ResetPasswordRequestDecorator = applyDecorators(
  ApiOperation({
    summary: 'User reset password',
    description: 'This endpoint allows a user to request a password reset.',
  }),
  ApiOkResponse({
    description: 'Reset password token created successfully.',
    type: ResetPasswordRequestResponseDTO,
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized. The provided credentials are invalid.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
