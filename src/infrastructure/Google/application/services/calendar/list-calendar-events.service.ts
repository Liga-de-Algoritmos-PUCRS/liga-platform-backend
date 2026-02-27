import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';

@Injectable()
export class ListCalendarEventsService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }
  async execute(authorId: string) {
    const calendar = await this.getCalendarClient(authorId);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(), // Apenas eventos futuros
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }
}
