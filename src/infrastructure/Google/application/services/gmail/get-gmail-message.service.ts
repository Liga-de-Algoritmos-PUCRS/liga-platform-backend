import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import {
  GmailMessageDetailsDTO,
  GmailAttachmentDTO,
} from '@/infrastructure/Google/application/dtos/gmail-message.dto';
import { gmail_v1 } from 'googleapis';

@Injectable()
export class GetGmailMessageService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(authorId: string, messageId: string): Promise<GmailMessageDetailsDTO> {
    const gmail = await this.getGmailClient(authorId);

    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return this.parseMessage(response.data);
    } catch (error: unknown) {
      const typedError = error as { response?: { status: number } };

      if (typedError.response?.status === 404) {
        throw this.ExceptionsAdapter.notFound({
          message: 'E-mail não encontrado ou acesso negado.',
        });
      }
      throw error;
    }
  }

  private parseMessage(messageData: gmail_v1.Schema$Message): GmailMessageDetailsDTO {
    const payload = messageData.payload;

    if (!payload) {
      throw this.ExceptionsAdapter.badRequest({
        message: 'O payload da mensagem está vazio.',
      });
    }

    const headers = payload.headers || [];

    const getHeader = (name: string): string => headers.find((h) => h.name === name)?.value || '';

    const subject = getHeader('Subject') || '(Sem Assunto)';
    const from = getHeader('From') || 'Desconhecido';
    const to = getHeader('To');
    const cc = getHeader('Cc');
    const bcc = getHeader('Bcc');
    const date = getHeader('Date');

    const htmlBody = this.findBodyContent(payload, 'text/html');
    const plainBody = this.findBodyContent(payload, 'text/plain');

    const finalBody = htmlBody || plainBody || '';
    const attachments = this.extractAttachments(payload);

    return {
      id: messageData.id || '',
      threadId: messageData.threadId || '',
      snippet: messageData.snippet || '',
      headers: {
        subject,
        from,
        to,
        cc,
        bcc,
        date,
      },
      body: finalBody,
      isHtml: !!htmlBody,
      attachments,
    };
  }

  private findBodyContent(part: gmail_v1.Schema$MessagePart, mimeType: string): string | null {
    if (part.mimeType === mimeType && part.body?.data) {
      return this.decodeBase64(part.body.data);
    }
    if (part.parts) {
      for (const subPart of part.parts) {
        const found = this.findBodyContent(subPart, mimeType);
        if (found) return found;
      }
    }

    return null;
  }

  private extractAttachments(part: gmail_v1.Schema$MessagePart): GmailAttachmentDTO[] {
    let attachments: GmailAttachmentDTO[] = [];

    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        attachmentId: part.body.attachmentId,
        size: part.body.size || 0,
      });
    }

    if (part.parts) {
      for (const subPart of part.parts) {
        attachments = attachments.concat(this.extractAttachments(subPart));
      }
    }

    return attachments;
  }

  private decodeBase64(data: string): string {
    const buff = Buffer.from(data, 'base64url');
    return buff.toString('utf-8');
  }
}
