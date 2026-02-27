import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '../google-helper-integration';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { FileMovimentationRepository } from '@/infrastructure/Triggers/FileMovimentation/domain/file-movimentation.repository';
import { FileMovimentation } from '@/infrastructure/Triggers/FileMovimentation/domain/file-movimentation.entity';

@Injectable()
export class HandleGoogleWebhookService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly LoggerAdapter: LoggerAdapter,
    readonly FileMovimentationRepository: FileMovimentationRepository,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(channelId: string, resourceState: string) {
    this.LoggerAdapter.debug({
      message: 'Recebendo atualização do Google Drive',
      where: 'HandleGoogleWebhookService',
    });

    if (resourceState !== 'update') {
      return;
    }

    const credentials = await this.GoogleCredentialsRepository.findByResourceId(channelId);

    if (!credentials) {
      this.LoggerAdapter.error({
        message: 'Nenhuma credencial encontrada para o canal',
        where: 'HandleGoogleWebhookService',
      });
      return;
    }

    const drive = await this.getDriveClient(credentials.authorId);

    const response = await drive.files.list({
      q: `'${credentials.folderId}' in parents and trashed = false`,
      orderBy: 'createdTime desc',
      pageSize: 1,
      fields: 'files(id, name, webContentLink)',
    });

    const files = response.data.files;

    this.LoggerAdapter.log({
      message: `Arquivos encontrados na pasta monitorada: ${files?.length || 0}`,
      where: 'HandleGoogleWebhookService',
    });

    if (!files || files.length === 0) {
      this.LoggerAdapter.log({
        message: 'Monitoramento: Pasta está vazia ou nenhum arquivo novo encontrado.',
        where: 'HandleGoogleWebhookService',
      });
      return;
    }

    const lastFile = files[0];

    if (lastFile) {
      await this.FileMovimentationRepository.createFileMovimentation(
        new FileMovimentation({
          authorId: credentials.authorId,
          filename: lastFile.name ?? '',
          driveFileId: lastFile.id ?? '',
          status: 'PENDING',
        }),
      );
    }
  }
}
