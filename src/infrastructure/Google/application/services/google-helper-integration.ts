import { google, calendar_v3, gmail_v1 } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { ConfigService } from '@nestjs/config';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';

@Injectable()
export class GoogleHelperIntegrationService {
  readonly oauth2Client: InstanceType<typeof google.auth.OAuth2>;

  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    const googleClientId = this.ConfigService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.ConfigService.get<string>('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = this.ConfigService.get<string>('GOOGLE_REDIRECT_URI');

    this.oauth2Client = new google.auth.OAuth2(
      googleClientId,
      googleClientSecret,
      googleRedirectUri,
    );
  }

  async getDriveClient(authorId: string) {
    const credentials = await this.GoogleCredentialsRepository.findByAuthorId(authorId);

    if (!credentials || credentials.length === 0) {
      throw this.ExceptionsAdapter.notFound({ message: 'Credenciais Google não encontradas' });
    }

    const userTokens = credentials[0];

    this.oauth2Client.setCredentials({
      access_token: userTokens.access_token,
      refresh_token: userTokens.refresh_token,
      expiry_date: Number(userTokens.expiry_date),
    });

    return google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  async getCalendarClient(authorId: string): Promise<calendar_v3.Calendar> {
    const credentials = await this.GoogleCredentialsRepository.findByAuthorId(authorId);

    if (!credentials || credentials.length === 0) {
      throw this.ExceptionsAdapter.notFound({ message: 'Credenciais Google não encontradas' });
    }

    const userTokens = credentials[0];

    this.oauth2Client.setCredentials({
      access_token: userTokens.access_token,
      refresh_token: userTokens.refresh_token,
      expiry_date: Number(userTokens.expiry_date),
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async getGmailClient(authorId: string): Promise<gmail_v1.Gmail> {
    const credentials = await this.GoogleCredentialsRepository.findByAuthorId(authorId);

    if (!credentials || credentials.length === 0) {
      throw this.ExceptionsAdapter.notFound({ message: 'Credenciais Google não encontradas' });
    }

    const userTokens = credentials[0];

    this.oauth2Client.setCredentials({
      access_token: userTokens.access_token,
      refresh_token: userTokens.refresh_token,
      expiry_date: Number(userTokens.expiry_date),
    });

    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }
}
