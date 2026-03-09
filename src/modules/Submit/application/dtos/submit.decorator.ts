import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { SubmitResponseDTO } from './submit-response.dto';

export const CreateSubmitDecorator = applyDecorators(
  ApiOperation({
    summary: 'Create Submit',
    description: 'This endpoint allows you to create a new submit',
  }),
  ApiCreatedResponse({ description: 'Submit created successfully', type: SubmitResponseDTO }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const GetSubmitByProblemIdDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Submit by Problem ID',
    description: 'This endpoint allows you to get a submit by its problem ID',
  }),
  ApiOkResponse({ description: 'Submit retrieved successfully', type: SubmitResponseDTO }),
  ApiNotFoundResponse({
    description: 'Submit not found. The submit with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const GetSubmitByUserIdDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Submit by User ID',
    description: 'This endpoint allows you to get a submit by its user ID',
  }),
  ApiOkResponse({ description: 'Submit retrieved successfully', type: SubmitResponseDTO }),
  ApiNotFoundResponse({
    description: 'Submit not found. The submit with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const GetAllSubmitsDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get All Submits',
    description: 'This endpoint allows you to get all submits',
  }),
  ApiOkResponse({ description: 'Submits retrieved successfully', type: SubmitResponseDTO }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);

export const DeleteSubmitDecorator = applyDecorators(
  ApiOperation({
    summary: 'Delete Submit',
    description: 'This endpoint allows you to delete a submit',
  }),
  ApiOkResponse({ description: 'Submit deleted successfully' }),
  ApiNotFoundResponse({
    description: 'Submit not found. The submit with the specified ID does not exist.',
  }),
  ApiBadRequestResponse({ description: 'Bad Request. The input data is invalid or missing.' }),
  ApiInternalServerErrorResponse({
    description:
      'Internal Server Error. An unexpected error occurred while processing the request.',
  }),
);
