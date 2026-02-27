import { Injectable } from '@nestjs/common';
import { GoogleHelperIntegrationService } from '@/infrastructure/Google/application/services/google-helper-integration';
import { createId } from '@paralleldrive/cuid2';
import { ConfigService } from '@nestjs/config';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';

@Injectable()
export class CreateDriveFolderWatchService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }
  async execute(authorId: string, folderId: string) {
    const drive = await this.getDriveClient(authorId);

    const channelId = createId();

    const response = await drive.files.watch({
      fileId: folderId,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: `${process.env.BACKEND_URL}/google/drive/webhook`,
      },
    });

    const credentials = await this.GoogleCredentialsRepository.findByAuthorId(authorId);
    if (credentials[0]) {
      const updated = credentials[0];
      updated.resourceId = channelId;
      updated.folderId = folderId;
      await this.GoogleCredentialsRepository.updateCredentials(updated);
    }
    return response.data;
  }
}
