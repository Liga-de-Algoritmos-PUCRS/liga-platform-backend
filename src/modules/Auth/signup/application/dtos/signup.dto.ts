import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { applyDecorators } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from "@nestjs/swagger";

export class SignupRequestDTO {
  @ApiProperty({
    description: "User email",
    example: "guilhermecassol@gmail.com",
    required: true,
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User name",
    example: "Guilherme Cassol",
    required: true,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: "User password",
    example: "Cassolzinho123*",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class SignupRequestResponseDTO {
  @ApiProperty({
    description: "Signup Token ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Token expiration date and time",
    example: "2024-12-31T23:59:59.000Z",
  })
  expiresAt: Date;

  @ApiProperty({
    description: "Indicates whether the token has been revoked",
    example: false,
  })
  isRevoked: boolean;
}

export const SignupDecorator = applyDecorators(
  ApiOperation({
    summary: "User signup",
    description: "This endpoint allows a user to sign in to the system.",
  }),
  ApiOkResponse({
    description: "User signed up successfully.",
    type: SignupRequestResponseDTO,
  }),
  ApiUnauthorizedResponse({
    description: "Unauthorized. The provided credentials are invalid.",
  }),
  ApiInternalServerErrorResponse({
    description:
      "Internal server error. An unexpected error occurred while processing the request.",
  }),
);
