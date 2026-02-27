import { Injectable } from '@nestjs/common';
import { GoogleCredentials } from '@/infrastructure/Google/domain/google-credentials.entity';
import { GoogleCredentialsRepository } from '@/infrastructure/Google/domain/google-credentials.repository';
import { PrismaService } from '@/infrastructure/Database/prisma.service';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { GoogleCredentialsMapper } from '@/infrastructure/Google/infra/persistence/google-credentials.mapper';

@Injectable()
export class PrismaGoogleCredentialsRepository implements GoogleCredentialsRepository {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly ExceptionsAdapter: ExceptionsAdapter,
  ) {}

  public async createCredentials(credentials: GoogleCredentials): Promise<GoogleCredentials> {
    const credentialsToPersist = GoogleCredentialsMapper.toPersistence(credentials);

    try {
      const createdCredentials = await this.Prisma.googleCredentials.create({
        data: credentialsToPersist,
      });
      this.LoggerAdapter.log({
        where: 'PrismaGoogleCredentialsRepository',
        message: `Google credentials processed for authorId: ${credentials.authorId}`,
      });
      return GoogleCredentialsMapper.toDomain(createdCredentials);
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'PrismaGoogleCredentialsRepository.createCredentials',
        message: `Error creating Google credentials: ${(error as Error).message}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Failed to create Google credentials',
      });
    }
  }

  public async findByResourceId(resourceId: string): Promise<GoogleCredentials | null> {
    const credentials = await this.Prisma.googleCredentials.findFirst({
      where: { resourceId },
    });

    this.LoggerAdapter.log({
      where: 'PrismaGoogleCredentialsRepository.findByResourceId',
      message: `Google credentials retrieved for resourceId ${resourceId}`,
    });
    if (!credentials) {
      return null;
    }

    return GoogleCredentialsMapper.toDomain(credentials);
  }

  public async findByAuthorId(authorId: string): Promise<GoogleCredentials[]> {
    const credentials = await this.Prisma.googleCredentials.findMany({
      where: { authorId },
    });

    this.LoggerAdapter.log({
      where: 'PrismaGoogleCredentialsRepository',
      message: `Google credentials processed for authorId: ${authorId}`,
    });
    return credentials.map((googleCredentials) =>
      GoogleCredentialsMapper.toDomain(googleCredentials),
    );
  }

  public async findById(id: string): Promise<GoogleCredentials | null> {
    const credentials = await this.Prisma.googleCredentials.findUnique({
      where: { id },
    });

    this.LoggerAdapter.log({
      where: 'PrismaGoogleCredentialsRepository.findById',
      message: `Google credentials retrieved for id ${id}: ${credentials ? 'found' : 'not found'}`,
    });

    if (!credentials) {
      return null;
    }

    return GoogleCredentialsMapper.toDomain(credentials);
  }

  public async findByEmail(email: string): Promise<GoogleCredentials | null> {
    const credentials = await this.Prisma.googleCredentials.findFirst({
      where: { email },
    });

    this.LoggerAdapter.log({
      where: 'PrismaGoogleCredentialsRepository.findByEmail',
      message: `Google credentials retrieved for email ${email}`,
    });
    if (!credentials) {
      return null;
    }

    return GoogleCredentialsMapper.toDomain(credentials);
  }

  public async findByHistoryId(historyId: string): Promise<GoogleCredentials | null> {
    const credentials = await this.Prisma.googleCredentials.findFirst({
      where: { historyId },
    });

    this.LoggerAdapter.log({
      where: 'PrismaGoogleCredentialsRepository.findByHistoryId',
      message: `Google credentials retrieved for historyId ${historyId}`,
    });
    if (!credentials) {
      return null;
    }

    return GoogleCredentialsMapper.toDomain(credentials);
  }

  public async updateHistoryId(googleCredentials: GoogleCredentials): Promise<GoogleCredentials> {
    const exists = await this.Prisma.googleCredentials.findUnique({
      where: { id: googleCredentials.id },
    });

    if (!exists) {
      throw this.ExceptionsAdapter.notFound({
        message: 'Google credentials not found',
      });
    }

    try {
      const updatedCredentials = await this.Prisma.googleCredentials.update({
        where: { id: googleCredentials.id },
        data: {
          historyId: googleCredentials.historyId,
        },
      });

      this.LoggerAdapter.log({
        where: 'PrismaGoogleCredentialsRepository.updateHistoryId',
        message: `Updated historyId for credentials ${googleCredentials.id}`,
      });

      return GoogleCredentialsMapper.toDomain(updatedCredentials);
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'PrismaGoogleCredentialsRepository.updateHistoryId',
        message: `Error updating historyId: ${(error as Error).message}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Failed to update historyId',
      });
    }
  }

  public async updateCredentials(credentials: GoogleCredentials): Promise<GoogleCredentials> {
    const credentialsToPersist = GoogleCredentialsMapper.toPersistence(credentials);

    try {
      const updatedCredentials = await this.Prisma.googleCredentials.update({
        where: { id: credentials.id },
        data: credentialsToPersist,
      });

      this.LoggerAdapter.log({
        where: 'PrismaGoogleCredentialsRepository.updateCredentials',
        message: `Google credentials updated for id: ${credentials.id}`,
      });

      return GoogleCredentialsMapper.toDomain(updatedCredentials);
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'PrismaGoogleCredentialsRepository.updateCredentials',
        message: `Error updating Google credentials: ${(error as Error).message}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Failed to update Google credentials',
      });
    }
  }

  public async deleteCredentials(id: string): Promise<boolean> {
    try {
      await this.Prisma.googleCredentials.delete({
        where: { id },
      });

      this.LoggerAdapter.log({
        where: 'PrismaGoogleCredentialsRepository.deleteCredentials',
        message: `Google credentials deleted with id: ${id}`,
      });

      return true;
    } catch (error) {
      this.LoggerAdapter.error({
        where: 'PrismaGoogleCredentialsRepository.deleteCredentials',
        message: `Error deleting Google credentials: ${(error as Error).message}`,
      });
      throw this.ExceptionsAdapter.internalServerError({
        message: 'Failed to delete Google credentials',
      });
    }
  }
}
