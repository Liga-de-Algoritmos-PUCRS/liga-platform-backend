import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export class VerifyPhoneRequestDTO {
  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}

export class ValidateVerifyPhoneResponseDTO {
  @ApiProperty({
    description: 'Token id',
    example: 'ivyuuzwcpdbblxmyplhx2tnh',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Indicates phone number to verify',
    example: '1234',
    required: true,
    type: String,
  })
  phone: string;

  @ApiProperty({
    description: 'Verification date',
    example: '2024-01-01T12:00:00Z',
    required: true,
    type: Date,
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Indicates if the token is revoked',
    example: false,
    required: true,
    type: Boolean,
  })
  isRevoked: boolean;
}

export const VerifyPhoneRequestDecorator = applyDecorators(
  ApiOperation({
    summary: 'User phone verification',
    description: 'This endpoint allows a user to verify their phone number.',
  }),
  ApiOkResponse({
    description: 'Phone verification token created successfully.',
    type: ValidateVerifyPhoneResponseDTO,
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized. The provided credentials are invalid.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
