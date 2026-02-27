import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LinkEmailToNegociationDTO } from '../../dtos/link-email-to-negociation.dto';
import { EventRepository } from '@/modules/Events/domain/event.repository';
import { Event } from '@/modules/Events/domain/event.entity';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';

@Injectable()
export class LinkEmailToNegociationService {
  constructor(
    private readonly ConfigService: ConfigService,
    private readonly EventRepository: EventRepository,
    private readonly NegociationRepository: NegociationRepository,
    private readonly Exceptions: ExceptionsAdapter,
    private readonly Logger: LoggerAdapter,
  ) {}

  async execute(dto: LinkEmailToNegociationDTO, userId: string): Promise<void> {
    const negociation = await this.NegociationRepository.getNegociationById(dto.negociationId);

    if (!negociation) {
      throw this.Exceptions.notFound({ message: 'Negociação não encontrada.' });
    }

    if (negociation.negociation.authorId !== userId) {
      throw this.Exceptions.unauthorized({
        message: 'You do not have permission to link this email to this negotiation.',
      });
    }

    const descriptionKey = `[GmailID:${dto.messageId}]`;

    const existingEvent = await this.EventRepository.findByNegociationAndDescription(
      dto.negociationId,
      descriptionKey,
    );

    if (existingEvent) {
      this.Logger.warn({
        message: `Attempt to duplicate email link: ${dto.messageId} by user ${userId}`,
        where: 'LinkEmailToNegociationService',
      });
      throw this.Exceptions.badRequest({ message: 'This email has already been linked.' });
    }

    const emailSubject = dto.emailData.headers?.subject || dto.emailData.subject || '(Sem Assunto)';

    const event = new Event({
      negociationId: dto.negociationId,
      actionType: 'CREATE',
      entityName: 'EMAIL',
      date: new Date(),
      description: `E-mail vinculado: ${emailSubject} ${descriptionKey}`,
    });

    await this.EventRepository.createEvent(event);

    const n8nWebhookUrl = this.ConfigService.get('N8N_WEBHOOK_GMAIL_LINK_URL') as string;
    const n8nToken = this.ConfigService.get('N8N_TOKEN_SECRET') as string;

    if (n8nWebhookUrl) {
      try {
        await axios.post(
          n8nWebhookUrl,
          {
            ...dto,
            linkedBy: userId,
            workspaceId: negociation.negociation.workspaceId,
            authorId: negociation.negociation.authorId,
            negociationInfo: negociation,
          },
          {
            headers: { Authorization: `Bearer ${n8nToken}` },
          },
        );
      } catch (error) {
        this.Logger.error({
          message: `Failed to send to N8N: ${error.message}`,
          where: 'LinkEmailToNegociationService',
        });
      }
    }
  }
}
