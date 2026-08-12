import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { SubmitResponseDTO } from './submit-response.dto';

export const CreateSubmitDecorator = applyDecorators(
  ApiOperation({
    summary: 'Create Submit',
    description:
      'Submits an answer to a problem. A wrong answer only counts an attempt and costs nothing. A right answer earns the current value of the problem, frozen at that instant, and lowers that value for the next solver. Each student can only solve a given problem once.',
  }),
  ApiCreatedResponse({ description: 'Submit created successfully', type: SubmitResponseDTO }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiConflictResponse({
    description: 'Conflict. The requester has already solved this problem, so nothing is credited.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const GetSubmitByProblemIdDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Submit by Problem ID',
    description: 'Admin only. This endpoint allows you to get a submit by its problem ID',
  }),
  ApiOkResponse({ description: 'Submit retrieved successfully', type: SubmitResponseDTO }),
  ApiNotFoundResponse({
    description: 'Submit not found. The submit with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiForbiddenResponse({ description: 'Forbidden. This endpoint requires an admin account.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const GetSubmitByUserIdDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Submit by User ID',
    description:
      'This endpoint allows you to get a submit by its user ID. Only the owner of the submissions or an admin can read them.',
  }),
  ApiOkResponse({ description: 'Submit retrieved successfully', type: [SubmitResponseDTO] }),
  ApiNotFoundResponse({
    description: 'Submit not found. The submit with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiForbiddenResponse({
    description:
      'Forbidden. The submissions belong to another user and the requester is not admin.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const GetAllSubmitsDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get All Submits',
    description: 'Admin only. This endpoint allows you to get all submits',
  }),
  ApiOkResponse({ description: 'Submits retrieved successfully', type: SubmitResponseDTO }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiForbiddenResponse({ description: 'Forbidden. This endpoint requires an admin account.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const DeleteSubmitDecorator = applyDecorators(
  ApiOperation({
    summary: 'Delete Submit',
    description: 'Admin only. This endpoint allows you to delete a submit',
  }),
  ApiOkResponse({ description: 'Submit deleted successfully' }),
  ApiNotFoundResponse({
    description: 'Submit not found. The submit with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiForbiddenResponse({ description: 'Forbidden. This endpoint requires an admin account.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);
