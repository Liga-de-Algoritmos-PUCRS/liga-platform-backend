import { SendEmailCommand } from '@aws-sdk/client-ses';
import { SendEmailHelperIntegration } from '@/infrastructure/SendEmail/application/send-email-Helper-integration';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SendEmailAccountCreatedService extends SendEmailHelperIntegration {
  constructor(
    readonly ConfigService: ConfigService,
    readonly LoggerAdapter: LoggerAdapter,
    readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {
    super(ConfigService, ExceptionsAdapter);
  }

  async execute(email: string, password: string, name?: string): Promise<void> {
    const subject = 'Sua conta no Bee CRM foi criada';
    const bodyHtml = this.loadTemplate(email, password, name);

    const command = new SendEmailCommand({
      Source: this.senderEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: bodyHtml, Charset: 'UTF-8' } },
      },
    });

    try {
      await this.sesClient.send(command);
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'SendEmailAccountCreatedService',
        message: `Error sending account creation email to: ${email}. Error: ${error}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Error trying to send account creation email.',
        internalKey: SendEmailExceptions.EMAIL_SENDING_FAILED,
      });
    }
  }

  private loadTemplate(email: string, password: string, name?: string): string {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'account-created-template.html');
      let html = fs.readFileSync(templatePath, 'utf-8');

      html = html
        .replace(/{{USER}}/g, name || 'Usuário')
        .replace(/{{EMAIL}}/g, email)
        .replace(/{{PASSWORD}}/g, password);

      return html;
    } catch (error) {
      this.LoggerAdapter.fatal({
        where: 'SendEmailAccountCreatedService',
        message: `Error loading account created email template. Error: ${error}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Error trying to load email template.',
      });
    }
  }
}
