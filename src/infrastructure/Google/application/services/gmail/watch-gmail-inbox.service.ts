import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { gmail_v1 } from 'googleapis';
import { WatchGmailInboxResponseDTO } from '../../dtos/watch-gmail-response.dto';

@Injectable()
export class WatchGmailInboxService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(authorId: string): Promise<WatchGmailInboxResponseDTO> {
    const gmail: gmail_v1.Gmail = await this.getGmailClient(authorId);

    const topicName = this.ConfigService.get<string>('GOOGLE_GMAIL_TOPIC');

    if (!topicName) {
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Configuração de Tópico do Pub/Sub (GOOGLE_GMAIL_TOPIC) ausente.',
      });
    }

    try {
      const response = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          labelIds: ['INBOX'],
          topicName: topicName,
        },
      });

      if (!response.data.historyId || !response.data.expiration) {
        throw this.ExceptionsAdapter.badRequest({
          message: 'Falha ao ativar o Watch: O Google não retornou historyId ou expiration.',
        });
      }

      return {
        historyId: response.data.historyId,
        expiration: response.data.expiration,
      };
    } catch (error) {
      throw this.ExceptionsAdapter.internalServerError({
        message: `Falha ao ativar o Watch: ${error}`,
      });
    }
  }
}
