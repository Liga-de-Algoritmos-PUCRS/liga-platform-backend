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
export class SendBugReportEmailService extends SendEmailHelperIntegration {
  constructor(
    readonly ConfigService: ConfigService,
    readonly LoggerAdapter: LoggerAdapter,
    readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {
    super(ConfigService, ExceptionsAdapter);
  }

  async execute(reporteremail: string, name: string, description: string): Promise<void> {
    const subject = 'Relatório de Bug';
    const bodyHtml = this.loadTemplate(reporteremail, name, description);

    const command = new SendEmailCommand({
      Source: this.senderEmail,
      Destination: {
        ToAddresses: ['bekirsch123@gmail.com'],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: bodyHtml,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      this.LoggerAdapter.log({
        where: 'SendBugEmailService',
        message: `SendBugEmailService.execute: Sending bug report email to admin`,
      });
      await this.sesClient.send(command);
    } catch (error) {
      this.LoggerAdapter.fatal({
        where: 'SendBugEmailService',
        message: `Error sending bug report email to admin. Error: ${error}`,
      });
      this.ExceptionsAdapter.internalServerError({
        message: 'Error trying to send bug report email.',
      });
      throw error;
    }
  }

  private loadTemplate(email: string, name: string, description: string): string {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'bug-report.html');
      let html = fs.readFileSync(templatePath, 'utf-8');

      html = html
        .replace(/{{NAME}}/g, name || '')
        .replace(/{{EMAIL}}/g, email || '')
        .replace(/{{DESCRIPTION}}/g, description || '');

      return html;
    } catch (error) {
      this.LoggerAdapter.fatal({
        where: 'SendBugEmailService',
        message: `Error loading bug report email template. Error: ${error}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Error trying to load email template.',
        internalKey: SendEmailExceptions.EMAIL_LOADING_FAILED,
      });
    }
  }
}
