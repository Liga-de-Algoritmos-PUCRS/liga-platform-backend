import { applyDecorators } from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiProperty,
  ApiNotFoundResponse,
  ApiOkResponse,
} from "@nestjs/swagger";

export class LoginRequestDTO {
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
    description: "User password",
    example: "Cassolzinho123*",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class LoginResponseDTO {
  @ApiProperty({
    description: "Access token for authenticated requests",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;
}

export const LoginDecorator = applyDecorators(
  ApiOperation({
    summary: "User login",
    description: "This endpoint allows a user to log in to the system.",
  }),
  ApiOkResponse({
    description: "User logged in successfully.",
    type: LoginResponseDTO,
  }),
  ApiUnauthorizedResponse({
    description: "Unauthorized. The provided credentials are invalid.",
  }),
  ApiInternalServerErrorResponse({
    description:
      "Internal server error. An unexpected error occurred while processing the request.",
  }),
);

export const LogoutDecorator = applyDecorators(
  ApiOperation({
    summary: "User logout",
    description: "This endpoint allows a user to log out from the system.",
  }),
  ApiOkResponse({
    description: "User logged out successfully.",
  }),
  ApiUnauthorizedResponse({
    description: "Unauthorized. The user is not authenticated.",
  }),
  ApiInternalServerErrorResponse({
    description:
      "Internal server error. An unexpected error occurred while processing the request.",
  }),
);

export const RefreshTokenDecorator = applyDecorators(
  ApiOperation({
    summary: "Refresh access token",
    description:
      "This endpoint allows a user to refresh their access token using a valid refresh token.",
  }),
  ApiOkResponse({
    description: "Access token refreshed successfully.",
    type: LoginResponseDTO,
  }),
  ApiNotFoundResponse({
    description:
      "User not found. The user associated with the refresh token does not exist.",
  }),
  ApiUnauthorizedResponse({
    description:
      "Unauthorized. The provided refresh token is invalid or expired.",
  }),
  ApiInternalServerErrorResponse({
    description:
      "Internal server error. An unexpected error occurred while processing the request.",
  }),
);
