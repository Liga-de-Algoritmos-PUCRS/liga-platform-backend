import { Injectable } from '@nestjs/common';
import { Credentials } from 'google-auth-library';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { ConfigService } from '@nestjs/config';
import { GoogleCredentials } from '@/infrastructure/Google/domain/google-credentials.entity';
import { GoogleHelperIntegrationService } from '@/infrastructure/Google/application/services/google-helper-integration';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';

@Injectable()
export class GetAuthGoogleTokensService extends GoogleHelperIntegrationService {
  constructor(
    readonly ConfigService: ConfigService,
    readonly ExceptionsAdapter: ExceptionsAdapter,
    readonly LoggerAdapter: LoggerAdapter,
    readonly GoogleCredentialsRepository: GoogleCredentialsRepository,
  ) {
    super(ConfigService, ExceptionsAdapter, GoogleCredentialsRepository);
  }

  async execute(code: string, authorId: string): Promise<Credentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      const existing = await this.GoogleCredentialsRepository.findByAuthorId(authorId);

      const googleCredentials = new GoogleCredentials(
        {
          authorId: authorId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          token_type: tokens.token_type,
          id_token: tokens.id_token,
          scope: tokens.scope,
        },
        existing[0]?.id,
      );

      if (existing.length > 0) {
        await this.GoogleCredentialsRepository.updateCredentials(googleCredentials);
      } else {
        await this.GoogleCredentialsRepository.createCredentials(googleCredentials);
      }

      return tokens;
    } catch (error) {
      this.LoggerAdapter.error({
        message: `Error exchanging code for tokens: ${error}`,
        where: 'GetAuthGoogleTokensService',
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Failed to exchange code and save tokens',
      });
    }
  }
}
