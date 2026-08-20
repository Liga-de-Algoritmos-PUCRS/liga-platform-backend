import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { NotTogetherWith } from '@/global/common/validators/not-together-with.validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

export class ValidateSignupDTO {
  @ApiProperty({
    description: 'User email',
    example: 'guilhermecassol@gmail.com',
    required: false,
  })
  // Valida o e-mail sempre que ele vier, e o exige quando nao veio `tokenId`.
  // O "veio so um" mora no @NotTogetherWith: escrito so com @ValidateIf, mandar
  // os dois juntos desligaria as duas condicoes e nenhum campo seria validado.
  @ValidateIf((dto: ValidateSignupDTO) => dto.email !== undefined || dto.tokenId === undefined)
  @IsEmail()
  @IsNotEmpty()
  @NotTogetherWith('tokenId')
  email?: string;

  @ApiProperty({
    description: 'Token id. Deprecated: kept only for backwards compatibility, prefer email.',
    example: 'ivyuuzwcpdbblxmyplhx2tnh',
    required: false,
  })
  @ValidateIf((dto: ValidateSignupDTO) => dto.tokenId !== undefined || dto.email === undefined)
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
}

export class ValidateSignupResponse {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'Guilherme Cassol',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'GuilhermeCassol@gmail.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T12:00:00.000Z',
    type: Date,
  })
  createdAt: Date;
}

export const ValidateSignupDecorator = applyDecorators(
  ApiOperation({
    summary: 'Validate signup',
    description: 'This endpoint allows a user to validate the signup token.',
  }),
  ApiOkResponse({
    description: 'Signup token validated successfully.',
    type: ValidateSignupResponse,
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized. The provided credentials are invalid.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
