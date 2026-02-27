import { Injectable } from '@nestjs/common';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { ConfigService } from '@nestjs/config';
import { GoogleHelperIntegrationService } from '@/infrastructure/Google/application/services/google-helper-integration';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { GetGoogleIntegrationStatusResponseDTO } from '@/infrastructure/Google/application/dtos/google-response';

@Injectable()
export class GetGoogleIntegrationStatus extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly LoggerAdapter: LoggerAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(authorId: string): Promise<GetGoogleIntegrationStatusResponseDTO> {
    this.LoggerAdapter.log({
      message: 'Checking Google integration status',
      where: 'GetGoogleDriveService',
    });

    const credentials = await this.GoogleCredentialsRepository.findByAuthorId(authorId);

    if (!credentials || credentials.length === 0) {
      this.LoggerAdapter.log({
        message: 'No Google credentials found for user',
        where: 'GetGoogleDriveService',
      });

      return {
        isConnected: false,
        folderId: null,
      };
    }

    const userCreds = credentials[0];

    return {
      isConnected: !!userCreds,
      folderId: userCreds?.folderId || null,
    };
  }
}
