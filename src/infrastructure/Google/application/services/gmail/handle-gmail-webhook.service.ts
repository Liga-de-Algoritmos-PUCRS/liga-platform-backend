import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { GetGmailMessageService } from './get-gmail-message.service';
import { gmail_v1 } from 'googleapis';
import { GooglePubSubMessageDTO } from '../../dtos/google-pubsub-message.dto';

interface GmailHistoryNotification {
  emailAddress: string;
  historyId: number;
}

interface GoogleError {
  status?: number;
  response?: { status: number };
  message: string;
}

@Injectable()
export class HandleGmailWebhookService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly LoggerAdapter: LoggerAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
    private readonly GetGmailMessageService: GetGmailMessageService,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(payload: GooglePubSubMessageDTO): Promise<void> {
    const notification = this.decodePayload(payload);

    if (!notification) {
      this.LoggerAdapter.error({
        message: 'Payload do Pub/Sub inválido ou malformado.',
        where: 'HandleGmailWebhookService',
      });
      return;
    }

    const { emailAddress, historyId: newHistoryId } = notification;

    const credentials = await this.GoogleCredentialsRepository.findByEmail(emailAddress);

    if (!credentials) {
      this.LoggerAdapter.warn({
        message: `Recebido webhook para e-mail desconhecido ou sem credenciais: ${emailAddress}`,
        where: 'HandleGmailWebhookService',
      });
      return;
    }

    const authorId = credentials.authorId;
    const lastHistoryId = credentials.historyId;

    const gmail = await this.getGmailClient(authorId);

    try {
      if (lastHistoryId) {
        await this.fetchAndProcessChanges(gmail, authorId, lastHistoryId, newHistoryId.toString());
      } else {
        this.LoggerAdapter.log({
          message: `Primeiro sync ou reset de histórico para: ${emailAddress}`,
          where: 'HandleGmailWebhookService',
        });
      }

      credentials.historyId = newHistoryId.toString();

      await this.GoogleCredentialsRepository.updateHistoryId(credentials);
    } catch (error: unknown) {
      const typedError = error as GoogleError;
      const status = typedError.status || typedError.response?.status;

      if (status === 404 || status === 400) {
        this.LoggerAdapter.warn({
          message: `HistoryId inválido ou expirado para ${emailAddress}. Necessário resync total (reiniciar Watch).`,
          where: 'HandleGmailWebhookService',
        });

        throw this.ExceptionsAdapter.badRequest({
          message: 'Histórico inválido. Necessário reiniciar o Watch.',
        });
      }

      this.LoggerAdapter.error({
        message: `Erro ao processar webhook: ${typedError.message}`,
        where: 'HandleGmailWebhookService',
      });

      throw this.ExceptionsAdapter.internalServerError({
        message: 'Erro interno ao processar notificações do Gmail.',
      });
    }
  }

  private decodePayload(payload: GooglePubSubMessageDTO): GmailHistoryNotification | null {
    try {
      if (!payload.message || !payload.message.data) return null;

      const dataString = Buffer.from(payload.message.data, 'base64').toString('utf-8');

      const data = JSON.parse(dataString) as GmailHistoryNotification;

      if (!data.emailAddress || !data.historyId) return null;

      return data;
    } catch (e) {
      this.LoggerAdapter.error({
        message: 'Falha ao fazer parse do JSON do Pub/Sub.',
        where: 'HandleGmailWebhookService',
      });
      return null;
    }
  }

  private async fetchAndProcessChanges(
    gmail: gmail_v1.Gmail,
    authorId: string,
    startHistoryId: string,
    currentHistoryId: string,
  ) {
    const historyResponse = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: startHistoryId,
      historyTypes: ['messageAdded'],
    });

    const histories = historyResponse.data.history;

    if (!histories || histories.length === 0) {
      return;
    }

    const newMessagesIds = new Set<string>();

    for (const record of histories) {
      if (record.messagesAdded) {
        for (const item of record.messagesAdded) {
          if (item.message?.id) {
            newMessagesIds.add(item.message.id);
          }
        }
      }
    }

    if (newMessagesIds.size === 0) return;

    this.LoggerAdapter.log({
      message: `Detectadas ${newMessagesIds.size} novas mensagens para processar.`,
      where: 'HandleGmailWebhookService',
    });

    for (const messageId of newMessagesIds) {
      try {
        const fullMessage = await this.GetGmailMessageService.execute(authorId, messageId);

        this.LoggerAdapter.log({
          message: `E-mail processado com sucesso: ${fullMessage.headers.subject} (ID: ${messageId})`,
          where: 'HandleGmailWebhookService',
        });
      } catch (err) {
        this.LoggerAdapter.error({
          message: `Falha ao baixar detalhes da mensagem ${messageId}`,
          where: 'HandleGmailWebhookService',
        });
      }
    }
  }
}
