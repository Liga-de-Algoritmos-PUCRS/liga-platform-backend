import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { File } from '../../domain/file.entity';
import { CreateFileHelperDTO } from '../dtos/create-file.dto';
import { BucketAdapter } from '@/infrastructure/Bucket/bucket.adapter';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { UserExceptions, FileExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';
import { EventRepository } from '@/modules/Events/domain/event.repository';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CreateFileService {
  constructor(
    private readonly ConfigService: ConfigService,
    private readonly FileRepository: FileRepository,
    private readonly AccountRepository: AccountRepository,
    private readonly NegociationRepository: NegociationRepository,
    private readonly BucketAdapter: BucketAdapter,
    private readonly Exception: ExceptionsAdapter,
    private readonly TransactionAdapter: TransactionAdapter,
    private readonly EventRepository: EventRepository,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  async execute(
    fileDto: CreateFileHelperDTO,
    authorId: string,
    negociationId?: string,
  ): Promise<File> {
    const author = await this.AccountRepository.getAccountById(authorId);
    if (!author) {
      throw this.Exception.badRequest({
        message: 'Author not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }

    const sanitizedFileName = fileDto.name.replace(/\s+/g, '');

    const key = `Workspace/${author.workspaceId}/${Date.now()}-${sanitizedFileName}`;

    try {
      const fileUrl = await this.BucketAdapter.uploadFile(fileDto.file, key);

      if (!fileUrl) {
        throw this.Exception.badRequest({
          message: 'Failed to upload at AWS bucket',
          internalKey: FileExceptions.FILE_UPLOAD_FAILED,
        });
      }
      const file = new File({
        name: fileDto.name,
        size: fileDto.size,
        type: fileDto.type,
        fileUrl: fileUrl,
        authorId: authorId,
        deleted: false,
        negociationId: negociationId,
      });

      const persisteFile = this.TransactionAdapter.transaction(async () => {
        const createdFile = await this.FileRepository.createFile(file);
        if (!createdFile) {
          throw this.Exception.internalServerError({
            message: 'Failed to create file',
            internalKey: FileExceptions.FILE_UPLOAD_FAILED,
          });
        }
        createdFile.fileUrl = this.BucketAdapter.getSignedUrlForInternalRead(createdFile.fileUrl);

        if (negociationId) {
          try {
            await this.EventRepository.createFileEvent('CREATE', negociationId);
            const negociationInfo =
              await this.NegociationRepository.getNegociationById(negociationId);
            const N8N_WEBHOOK_BUCKETTRIGER_URL = this.ConfigService.get<string>(
              'N8N_WEBHOOK_BUCKETTRIGER_URL',
            );
            if (N8N_WEBHOOK_BUCKETTRIGER_URL) {
              const response = await axios.post(N8N_WEBHOOK_BUCKETTRIGER_URL, {
                authorId: authorId,
                negociationInfo: negociationInfo,
                BucketFilePath: file.fileUrl,
                fileName: fileDto.name,
                timestamp: new Date().toISOString(),
              });
              if (response.status >= 300) {
                this.LoggerAdapter.error({
                  message: `Failed to activate n8n webhook for File with ID ${createdFile.id}. Status: ${response.status}`,
                  where: 'CreateFileService.execute',
                });
              }
            }
          } catch (error) {
            this.LoggerAdapter.error({
              message: `Error creating event or triggering n8n for File with ID ${createdFile.id}. Error: ${error}`,
              where: 'CreateFileService.execute',
            });
          }
        }
        return createdFile;
      });
      return persisteFile;
    } catch (error) {
      await this.BucketAdapter.deleteFile(key);
      this.LoggerAdapter.error({
        where: 'CreateFileService',
        message: `Error creating file for authorId: ${authorId} with file name: ${fileDto.name}. Error: ${error}`,
      });
      throw this.Exception.internalServerError({
        message: 'File creation failed',
        internalKey: FileExceptions.FILE_UPLOAD_FAILED,
      });
    }
  }
}
