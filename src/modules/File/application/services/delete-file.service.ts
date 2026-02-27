import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { BucketAdapter } from '@/infrastructure/Bucket/bucket.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';
import { FileExceptions, UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';
import axios from 'axios';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { EventRepository } from '@/modules/Events/domain/event.repository';

@Injectable()
export class DeleteFileService {
  constructor(
    private readonly AccountRepository: AccountRepository,
    private readonly NegociationRepository: NegociationRepository,
    private readonly FileRepository: FileRepository,
    private readonly BucketAdapter: BucketAdapter,
    private readonly Exception: ExceptionsAdapter,
    private readonly EventRepository: EventRepository,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly TransactionAdapter: TransactionAdapter,
  ) {}

  async execute(id: string, authorId: string): Promise<void> {
    const file = await this.FileRepository.getFileById(id);
    if (!file) {
      throw this.Exception.notFound({
        message: 'No file found',
        internalKey: FileExceptions.FILE_NOT_FOUND,
      });
    }
    if (file.deleted) {
      throw this.Exception.badRequest({
        message: 'File already deleted',
        internalKey: FileExceptions.FILE_ALREADY_DELETED,
      });
    }

    if (file.negociationId) {
      const negociation = await this.NegociationRepository.getNegociationById(file.negociationId);
      const author = await this.AccountRepository.getAccountById(authorId);
      if (!negociation || !author || negociation.negociation.workspaceId !== author.workspaceId) {
        throw this.Exception.forbidden({
          message: 'You do not have permission to delete this file',
          internalKey: UserExceptions.USER_NOT_ALLOWED,
        });
      }
    } else {
      if (file.authorId !== authorId) {
        throw this.Exception.forbidden({
          message: 'You do not have permission to delete this file',
          internalKey: UserExceptions.USER_NOT_ALLOWED,
        });
      }
    }

    return this.TransactionAdapter.transaction(async () => {
      try {
        await this.BucketAdapter.deleteFile(file.fileUrl);
      } catch (error) {
        this.LoggerAdapter.error({
          where: 'DeleteFileService',
          message: `Error deleting file from storage for file ID: ${id}, URL: ${file.fileUrl}. Error: ${error}`,
        });
        throw this.Exception.internalServerError({
          message: 'Failed to delete file from storage',
          internalKey: FileExceptions.FILE_UPLOAD_FAILED,
        });
      }
      if (file.negociationId) {
        await this.EventRepository.createFileEvent('DELETE', file.negociationId);
      }
      await this.FileRepository.deleteFile(id);
      await axios.post(`${process.env.N8N_WEBHOKK_DELETETRIGER_URL}`, {
        fileKey: file.fileUrl,
      });
    });
  }
}
