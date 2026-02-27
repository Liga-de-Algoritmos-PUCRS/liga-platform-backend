import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { createId } from '@paralleldrive/cuid2';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { CreateGoogleEventDTO } from '@/infrastructure/Google/application/dtos/create-google-event.dto';
import { CreateEventResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';

@Injectable()
export class CreateCalendarEventService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
    readonly LoggerAdapter: LoggerAdapter,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(authorId: string, data: CreateGoogleEventDTO): Promise<CreateEventResponseDTO> {
    const calendar = await this.getCalendarClient(authorId);

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      this.LoggerAdapter.error({
        message: `End time must be after start time`,
        where: 'CreateCalendarEventService',
      });
      throw this.ExceptionsAdapter.badRequest({
        message: 'End time must be after start time',
      });
    }

    const event = {
      summary: data.summary,
      description: data.description,
      start: { dateTime: data.startTime, timeZone: 'America/Sao_Paulo' },
      end: { dateTime: data.endTime, timeZone: 'America/Sao_Paulo' },
      attendees: data.attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: createId(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    this.LoggerAdapter.log({
      message: `Created calendar event with ID: ${response.data.id}`,
      where: 'CreateCalendarEventService',
    });

    if (!response.data) {
      this.LoggerAdapter.error({
        message: `No data returned from Google Calendar API`,
        where: 'CreateCalendarEventService',
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Failed to create calendar event',
      });
    }

    return {
      id: response.data.id as string,
      link: response.data.htmlLink as string,
      meetlink: response.data.conferenceData?.entryPoints?.[0]?.uri as string,
    };
  }
}
