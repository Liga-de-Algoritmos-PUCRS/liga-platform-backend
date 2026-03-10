import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ProblemResponseDTO } from './problem.response';

export const CreateProblemDecorator = applyDecorators(
  ApiOperation({
    summary: 'Create a new problem',
    description: 'This endpoint allows you to create a new problem in the system.',
  }),
  ApiCreatedResponse({
    description: 'Problem created successfully.',
    type: ProblemResponseDTO,
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const UpdateProblemDecorator = applyDecorators(
  ApiOperation({
    summary: 'Update an existing problem',
    description: 'This endpoint allows you to update an existing problem in the system.',
  }),
  ApiOkResponse({
    description: 'Problem updated successfully.',
    type: ProblemResponseDTO,
  }),
  ApiNotFoundResponse({
    description: 'Problem not found. The problem with the specified ID  does not exist.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetAllProblemsDecorator = applyDecorators(
  ApiOperation({
    summary: 'List all problems',
    description: 'This endpoint retrieves a list of all problems in the system.',
  }),
  ApiOkResponse({
    description: 'List of problems retrieved successfully.',
    type: [ProblemResponseDTO],
  }),
);

export const GetProblemByIdDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get problem by ID',
    description: 'This endpoint retrieves a problem by its ID.',
  }),
  ApiOkResponse({
    description: 'Problem retrieved successfully.',
    type: ProblemResponseDTO,
  }),
  ApiNotFoundResponse({
    description: 'Problem not found. The problem with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetAdminProblemByIdDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get problem by ID',
    description: 'This endpoint retrieves a problem by its ID.',
  }),
  ApiOkResponse({
    description: 'Problem retrieved successfully.',
    type: ProblemResponseDTO,
  }),
  ApiNotFoundResponse({
    description: 'Problem not found. The problem with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const DeleteProblemDecorator = applyDecorators(
  ApiOperation({
    summary: 'Delete a problem',
    description: 'This endpoint allows you to delete a problem from the system.',
  }),
  ApiOkResponse({
    description: 'Problem deleted successfully.',
  }),
  ApiNotFoundResponse({
    description: 'Problem not found. The problem with the specified ID does not exist.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
