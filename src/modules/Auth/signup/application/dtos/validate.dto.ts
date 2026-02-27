import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { applyDecorators } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from "@nestjs/swagger";

export class ValidateSignupDTO {
  @ApiProperty({
    description: "Token id",
    example: "ivyuuzwcpdbblxmyplhx2tnh",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  tokenId: string;

  @ApiProperty({
    description: "Indicates if the token has 4 digits",
    example: "1234",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ValidateSignupResponse {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: String,
  })
  id: string;

  @ApiProperty({
    description: "User name",
    example: "Guilherme Cassol",
    type: String,
  })
  name: string;

  @ApiProperty({
    description: "User email",
    example: "GuilhermeCassol@gmail.com",
    type: String,
  })
  email: string;

  @ApiProperty({
    description: "User creation date",
    example: "2024-01-01T12:00:00.000Z",
    type: Date,
  })
  createdAt: Date;
}

export const ValidateSignupDecorator = applyDecorators(
  ApiOperation({
    summary: "Validate signup",
    description: "This endpoint allows a user to validate the signup token.",
  }),
  ApiOkResponse({
    description: "Signup token validated successfully.",
    type: ValidateSignupResponse,
  }),
  ApiUnauthorizedResponse({
    description: "Unauthorized. The provided credentials are invalid.",
  }),
  ApiInternalServerErrorResponse({
    description:
      "Internal server error. An unexpected error occurred while processing the request.",
  }),
);
