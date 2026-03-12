import { IsNotEmpty, IsString } from 'class-validator';
import {
  ApiOperation,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export class ReportBugServiceDTO {
  @ApiProperty({
    description: 'Description of the bug being reported',
    example: 'When I click the submit button, nothing happens.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export const ReportBugDecorator = applyDecorators(
  ApiOperation({
    summary: 'Report a bug',
    description: 'This endpoint allows users to report a bug in the system.',
  }),
  ApiOkResponse({
    description: 'Bug reported successfully.',
  }),
  ApiBadRequestResponse({
    description: 'Bad request. The input data is invalid or missing.',
  }),
  ApiInternalServerErrorResponse({
    description:
      'Internal server error. An unexpected error occurred while processing the request.',
  }),
);
