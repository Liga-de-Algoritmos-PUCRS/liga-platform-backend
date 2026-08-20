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
    description: 'Public confirmation message. Identical whether the email has an account or not.',
    example: 'If this email exists, a code has been sent.',
  })
  message: string;

  @ApiProperty({
    description: 'How long the code is valid for, in seconds.',
    example: 900,
  })
  expiresInSeconds: number;
}

export const ResetPasswordRequestDecorator = applyDecorators(
  ApiOperation({
    summary: 'User reset password',
    description: 'This endpoint allows a user to request a password reset.',
  }),
  ApiOkResponse({
    description:
      'Always 200, whether or not the email has an account, to avoid leaking which emails are registered.',
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
