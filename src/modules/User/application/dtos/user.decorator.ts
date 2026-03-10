import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDTO } from './response-user.dto';

export const CreateUserDecorator = applyDecorators(
  ApiOperation({
    summary: 'Create a new user',
    description: 'This endpoint allows you to create a new user in the system.',
  }),
  ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserResponseDTO,
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const UpdateUserDecorator = applyDecorators(
  ApiOperation({
    summary: 'Update an existing user',
    description: 'This endpoint allows you to update an existing user in the system.',
  }),
  ApiOkResponse({
    description: 'User updated successfully.',
    type: UserResponseDTO,
  }),
  ApiNotFoundResponse({
    description: 'User not found. The user with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetAllUsersDecorator = applyDecorators(
  ApiOperation({
    summary: 'List all users',
    description: 'This endpoint retrieves a list of all users in the system.',
  }),
  ApiOkResponse({
    description: 'List of users retrieved successfully.',
    type: [UserResponseDTO],
  }),
  ApiNotFoundResponse({
    description: 'No users found. The system does not contain any users.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetUserDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get a user by ID',
    description: 'This endpoint retrieves a user by their unique ID.',
  }),
  ApiOkResponse({
    description: 'User retrieved successfully.',
    type: UserResponseDTO,
  }),
  ApiNotFoundResponse({
    description: 'User not found. The user with the specified ID does not exist.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetUserInformations = applyDecorators(
  ApiOperation({
    summary: 'Get a user',
    description: 'This endpoint retrieves a user by their unique ID.',
  }),
  ApiOkResponse({
    description: 'User retrieved successfully.',
    type: UserResponseDTO,
  }),
  ApiNotFoundResponse({
    description: 'User not found. The user with the specified ID does not exist.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const DeleteUserDecorator = applyDecorators(
  ApiOperation({
    summary: 'Delete a user',
    description: 'This endpoint allows you to delete a user from the system.',
  }),
  ApiOkResponse({
    description: 'User deleted successfully.',
  }),
  ApiNotFoundResponse({
    description: 'User not found. The user with the specified ID does not exist.',
    schema: {
      example: {
        message: 'User not found with the provided ID',
      },
    },
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid authentication credentials provided.',
    schema: {
      example: {
        message: 'Invalid password provided',
      },
    },
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to delete this user.',
    schema: {
      example: {
        message: "User doesn't have permission",
      },
    },
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetTopUsersDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get top users',
    description: 'This endpoint retrieves the top users based on their performance.',
  }),
  ApiOkResponse({
    description: 'Top users retrieved successfully.',
    type: [UserResponseDTO],
  }),
  ApiNotFoundResponse({
    description: 'No top users found. The system does not contain any top users.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetMonthlyTopUsersDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get monthly top users',
    description: 'This endpoint retrieves the top users of the month based on their performance.',
  }),
  ApiOkResponse({
    description: 'Monthly top users retrieved successfully.',
    type: [UserResponseDTO],
  }),
  ApiNotFoundResponse({
    description: 'No monthly top users found. The system does not contain any monthly top users.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const ResetUserPointsDecorator = applyDecorators(
  ApiOperation({
    summary: 'Reset user points',
    description: 'This endpoint allows you to reset the points of all users in the system.',
  }),
  ApiOkResponse({
    description: 'User points reset successfully.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
