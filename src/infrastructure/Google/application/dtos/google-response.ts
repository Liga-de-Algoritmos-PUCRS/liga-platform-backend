import { ApiProperty } from '@nestjs/swagger';

export class GoogleResponseCredentialsDTO {
  @ApiProperty({
    description: 'Access token for Google API',
    example: 'ya29.a0AfH6SMC...',
    type: String,
    required: true,
  })
  access_token?: string;

  @ApiProperty({
    description: 'Refresh token for Google API',
    example: '1//0gL...',
    type: String,
    required: true,
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Expiry date of the access token in milliseconds since epoch',
    example: 1672531199000,
    type: Number,
    required: true,
  })
  expiry_date: number;

  @ApiProperty({
    description: 'Type of the token',
    example: 'Bearer',
    type: String,
    required: false,
  })
  token_type?: string | null;

  @ApiProperty({
    description: 'ID token containing identity information about the user',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    type: String,
    required: false,
  })
  id_token?: string | null;

  @ApiProperty({
    description: 'Scopes of access granted by the access token',
    example: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email',
    type: String,
    required: false,
  })
  scope?: string;
}

export class GetAuthGoogleUrlServiceResponseDTO {
  @ApiProperty({
    description: 'URL to initiate Google OAuth2 authentication',
    example: 'https://accounts.google.com/o/oauth2/auth?...',
    type: String,
    required: true,
  })
  url: string;
}

export class GetGoogleIntegrationStatusResponseDTO {
  @ApiProperty({
    description: 'Indicates if Google Drive is connected',
    example: true,
    type: Boolean,
    required: true,
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'ID of the monitored Google Drive folder, if any',
    example: '1A2B3C4D5E6F7G8H9I0J',
    type: String,
    required: false,
  })
  folderId?: string | null;
}

export class CreateEventResponseDTO {
  @ApiProperty({
    description: 'ID of the created calendar event',
    example: 'abcd1234efgh5678ijkl9012',
    type: String,
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Link to view the created calendar event in Google Calendar',
    example: 'https://www.google.com/calendar/event?eid=abcd1234efgh5678ijkl9012',
    type: String,
    required: true,
  })
  link: string;

  @ApiProperty({
    description: 'HTML link to the created calendar event',
    example: 'https://calendar.google.com/calendar/event?eid=abcd1234efgh5678ijkl9012',
    type: String,
    required: true,
  })
  meetlink: string;
}
