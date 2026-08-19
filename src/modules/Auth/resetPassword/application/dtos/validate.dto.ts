import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export class ValidateResetPasswordDTO {
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
}

export const ValidateResetPasswordDecorator = applyDecorators(
  ApiOperation({
    summary: 'Validate Reset Password',
    description: 'This endpoint allows a user to validate the reset password token.',
  }),
  ApiOkResponse({
    description: 'Reset password token validated successfully.',
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized. The provided credentials are invalid.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
