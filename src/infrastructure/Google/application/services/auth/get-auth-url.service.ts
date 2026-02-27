import { Injectable } from '@nestjs/common';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { ConfigService } from '@nestjs/config';
import { GoogleHelperIntegrationService } from '@/infrastructure/Google/application/services/google-helper-integration';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { GetAuthGoogleUrlServiceResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';

@Injectable()
export class GetAuthGoogleUrlService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly LoggerAdapter: LoggerAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  execute(userId: string): GetAuthGoogleUrlServiceResponseDTO {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.readonly', // Permissão para ler arquivos do Google Drive
        'https://www.googleapis.com/auth/userinfo.profile', // Permissão para acessar informações básicas do perfil do usuário
        'https://www.googleapis.com/auth/drive.file', // Permite acessar o que for selecionado no Picker
        'https://www.googleapis.com/auth/drive.metadata.readonly', // Necessário para listar conteúdo e metadados
        'https://www.googleapis.com/auth/calendar', // Permissão para acessar o Google Calendar
        'https://www.googleapis.com/auth/calendar.events', // Permissão para gerenciar eventos do Google Calendar
        'https://www.googleapis.com/auth/gmail.readonly', // Permissão para acessar o Gmail
        'https://www.googleapis.com/auth/gmail.send', // Permissão para enviar e-mails
        'https://www.googleapis.com/auth/gmail.modify', // Recomendado para gerenciar threads
      ],
      prompt: 'consent',
      state: userId,
    });

    this.LoggerAdapter.log({
      message: 'Google Auth URL generated"',
      where: 'GetAuthGoogleUrlService',
    });

    return { url: url };
  }
}
