import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { gmail_v1 } from 'googleapis'; // Importe para tipagem

@Injectable()
export class ListGmailMessagesService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(authorId: string, maxResults: number) {
    const gmail = await this.getGmailClient(authorId);

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: 'in:inbox',
    });

    const messages = listResponse.data.messages;

    if (!messages || messages.length === 0) {
      return [];
    }

    const emailDetailsPromises = messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      return this.parseEmail(detail.data);
    });

    return Promise.all(emailDetailsPromises);
  }

  private parseEmail(messageData: gmail_v1.Schema$Message) {
    const payload = messageData.payload;
    if (!payload) return null;

    const headers = payload.headers;
    const subject = headers?.find((h) => h.name === 'Subject')?.value || '(Sem Assunto)';
    const from = headers?.find((h) => h.name === 'From')?.value || 'Desconhecido';
    const date = headers?.find((h) => h.name === 'Date')?.value;

    let body = '';

    if (payload.body?.data) {
      body = this.decodeBase64(payload.body.data);
    } else if (payload.parts) {
      body =
        this.findBodyContent(payload.parts, 'text/html') ||
        this.findBodyContent(payload.parts, 'text/plain') ||
        '';
    }

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      snippet: messageData.snippet, // Use isso para a prévia na lista!
      subject,
      from,
      date,
      body,
    };
  }

  private findBodyContent(parts: gmail_v1.Schema$MessagePart[], mimeType: string): string | null {
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) {
        return this.decodeBase64(part.body.data);
      }

      if (part.parts) {
        const found = this.findBodyContent(part.parts, mimeType);
        if (found) return found;
      }
    }
    return null;
  }

  private decodeBase64(data: string): string {
    const buff = Buffer.from(data, 'base64url');
    return buff.toString('utf-8');
  }
}
