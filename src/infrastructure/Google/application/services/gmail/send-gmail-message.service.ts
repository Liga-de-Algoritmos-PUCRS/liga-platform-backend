import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import {
  SendGmailMessageDTO,
  SendGmailMessageResponseDTO,
} from '../../dtos/send-gmail-message.dto';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';

@Injectable()
export class SendGmailMessageService extends GoogleHelperIntegrationService {
  private readonly logger = new Logger(SendGmailMessageService.name);

  constructor(
    readonly configService: ConfigService,
    readonly exceptionsAdapter: ExceptionsAdapter,
    readonly googleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(configService, exceptionsAdapter, googleCredentialsRepository);
  }

  async execute(authorId: string, dto: SendGmailMessageDTO): Promise<SendGmailMessageResponseDTO> {
    try {
      // 1. Obter o cliente autenticado via método da classe pai
      const gmail = await this.getGmailClient(authorId);

      // 2. Preparar os cabeçalhos para Resposta (Threading)
      let threadId: string | undefined;
      const extraHeaders: string[] = [];

      if (dto.replyToMessageId) {
        // Busca metadados da mensagem original para manter a thread
        const originalMsg = await gmail.users.messages.get({
          userId: 'me',
          id: dto.replyToMessageId,
          format: 'metadata',
          metadataHeaders: ['Message-ID', 'References', 'Subject'],
        });

        threadId = originalMsg.data.threadId || undefined;
        const headers = originalMsg.data.payload?.headers;

        if (headers) {
          const msgId = headers.find((h) => h.name === 'Message-ID')?.value;
          const references = headers.find((h) => h.name === 'References')?.value;

          if (msgId) {
            extraHeaders.push(`In-Reply-To: ${msgId}`);
            // Concatena referências anteriores para manter o histórico
            extraHeaders.push(`References: ${references ? `${references} ${msgId}` : msgId}`);
          }
        }
      }

      // 3. Montar a mensagem crua (Raw Base64URL)
      const rawMessage = this.makeBody(
        dto.to,
        'me', // 'me' é substituído automaticamente pelo e-mail do usuário autenticado
        dto.subject,
        dto.body,
        extraHeaders,
      );

      // 4. Enviar
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMessage,
          threadId: threadId, // Vincula à thread existente se for resposta
        },
      });

      this.logger.log(`Email enviado com sucesso. ID: ${response.data.id}`);

      const result: SendGmailMessageResponseDTO = {
        id: response.data.id!,
        threadId: response.data.threadId!,
        labelIds: response.data.labelIds || [],
      };

      return result;
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail via Gmail', error);
      throw new BadRequestException('Falha ao enviar e-mail. Verifique a conexão com o Google.');
    }
  }

  // Função auxiliar para criar o formato MIME
  private makeBody(
    to: string,
    from: string,
    subject: string,
    message: string,
    extraHeaders: string[] = [],
  ): string {
    const str = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ...extraHeaders,
      '',
      message,
    ].join('\n');

    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
