import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiBody,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger';
import {
  GetGoogleIntegrationStatusResponseDTO,
  GetAuthGoogleUrlServiceResponseDTO,
} from '@/infrastructure/Google/application/dtos/google-response';
import { CreateEventResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';
import { CreateDriveWatchDTO } from '@/infrastructure/Google/application/dtos/create-drive-watch.dto';
import { CreateGoogleEventDTO } from '@/infrastructure/Google/application/dtos/create-google-event.dto';
import { WatchGmailInboxResponseDTO } from '@/infrastructure/Google/application/dtos/watch-gmail-response.dto';

export const GoogleCallbackDecorator = applyDecorators(
  ApiOperation({
    summary: 'Google OAuth2 Callback',
    description: 'This endpoint handles the OAuth2 callback from Google after user authentication.',
  }),
  ApiOkResponse({
    description: 'User successfully authenticated with Google.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiNotFoundResponse({
    description: 'Not found. The requested resource does not exist.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetAuthGoogleUrlDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Google Authentication URL',
    description:
      'This endpoint generates a Google authentication URL for the user to authorize access to their Google Drive and profile information.',
  }),
  ApiOkResponse({
    description: 'Google authentication URL generated successfully.',
    type: GetAuthGoogleUrlServiceResponseDTO,
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetGoogleIntegrationStatusDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Google Integration Status',
    description:
      'This endpoint checks if the user has integrated their Google account and retrieves the integration status.',
  }),
  ApiOkResponse({
    description: 'Google integration status retrieved successfully.',
    type: GetGoogleIntegrationStatusResponseDTO,
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const CreateDriveFolderWatchDecorator = applyDecorators(
  ApiOperation({
    summary: 'Create Google Drive Folder Watch',
    description:
      'This endpoint sets up a watch on a specified Google Drive folder to monitor changes.',
  }),
  ApiCreatedResponse({
    description: 'Google Drive folder watch created successfully.',
  }),
  ApiConsumes('application/json'),
  ApiBody({ type: CreateDriveWatchDTO }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiPayloadTooLargeResponse({
    description: 'Payload too large. The request body exceeds the maximum allowed size.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const CreateCalendarEventDecorator = applyDecorators(
  ApiOperation({
    summary: 'Create Google Calendar Event',
    description:
      "This endpoint creates a new event in the user's Google Calendar with the provided details.",
  }),
  ApiCreatedResponse({
    description: 'Google Calendar event created successfully.',
    type: CreateEventResponseDTO,
  }),
  ApiConsumes('application/json'),
  ApiBody({ type: CreateGoogleEventDTO }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const ListCalendarEventsDecorator = applyDecorators(
  ApiOperation({
    summary: 'List Google Calendar Events',
    description:
      "This endpoint retrieves a list of upcoming events from the user's Google Calendar.",
  }),
  ApiOkResponse({
    description: 'Google Calendar events retrieved successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const WatchGmailInboxDecorator = applyDecorators(
  ApiOperation({
    summary: 'Watch Gmail Inbox',
    description:
      "This endpoint sets up a watch on the user's Gmail inbox to monitor for new emails.",
  }),
  ApiCreatedResponse({
    description: 'Gmail inbox watch created successfully.',
    type: WatchGmailInboxResponseDTO,
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const HandleGmailWebhookDecorator = applyDecorators(
  ApiOperation({
    summary: 'Handle Gmail Webhook',
    description:
      'This endpoint handles webhook notifications from Google when new emails are received.',
  }),
  ApiCreatedResponse({
    description: 'Gmail webhook handled successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const ListGmailMessagesDecorator = applyDecorators(
  ApiOperation({
    summary: 'List Gmail Messages',
    description: "This endpoint retrieves a list of messages from the user's Gmail inbox.",
  }),
  ApiOkResponse({
    description: 'Gmail messages retrieved successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const GetGmailMessageDecorator = applyDecorators(
  ApiOperation({
    summary: 'Get Gmail Message',
    description: "This endpoint retrieves a specific message from the user's Gmail inbox.",
  }),
  ApiOkResponse({
    description: 'Gmail message retrieved successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const SendGmailMessageDecorator = applyDecorators(
  ApiOperation({
    summary: 'Send Gmail Message',
    description: "This endpoint sends a message to the user's Gmail inbox.",
  }),
  ApiCreatedResponse({
    description: 'Gmail message sent successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);

export const LinkEmailToNegociationDecorator = applyDecorators(
  ApiOperation({
    summary: 'Link Email to Negociation',
    description: 'This endpoint links an email to a negotiation.',
  }),
  ApiCreatedResponse({
    description: 'Email linked to negotiation successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiForbiddenResponse({
    description: 'Forbidden. You do not have permission to access this resource.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
