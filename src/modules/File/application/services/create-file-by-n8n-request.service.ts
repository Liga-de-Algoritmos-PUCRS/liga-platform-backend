import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { File } from '../../domain/file.entity';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { FileExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { LoggerAdapter } from '@/infrastructure/Logger/logger.adapter';
import { TransactionAdapter } from '@/infrastructure/Database/Transaction/transaction.adapter';
import { EventRepository } from '@/modules/Events/domain/event.repository';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';
import { CreateFileByN8NRequestDTO } from '../dtos/create-file-by-n8n-request.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CreateFileByN8NRequestService {
  constructor(
    private readonly ConfigService: ConfigService,
    private readonly FileRepository: FileRepository,
    private readonly AccountRepository: AccountRepository,
    private readonly NegociationRepository: NegociationRepository,
    private readonly Exception: ExceptionsAdapter,
    private readonly TransactionAdapter: TransactionAdapter,
    private readonly EventRepository: EventRepository,
    private readonly LoggerAdapter: LoggerAdapter,
  ) {}

  async execute(fileDto: CreateFileByN8NRequestDTO): Promise<File> {
    const account = await this.AccountRepository.getAccountById(fileDto.authorId);
    if (!account) {
      this.Exception.badRequest({ message: 'Account not found' });
    }
    const negociation = await this.NegociationRepository.getNegociationById(fileDto.negociationId);
    if (!negociation) {
      this.Exception.badRequest({ message: 'Negociation not found' });
    }
    const file = new File({
      name: fileDto.name,
      size: fileDto.size,
      type: fileDto.type,
      fileUrl: fileDto.fileUrl,
      authorId: fileDto.authorId,
      deleted: false,
      negociationId: fileDto.negociationId,
    });

    try {
      const persisteFile = this.TransactionAdapter.transaction(async () => {
        const createdFile = await this.FileRepository.createFile(file);
        if (!createdFile) {
          throw this.Exception.internalServerError({
            message: 'Failed to create file',
            internalKey: FileExceptions.FILE_UPLOAD_FAILED,
          });
        }
        await this.EventRepository.createFileEvent('CREATE', fileDto.negociationId);

        return createdFile;
      });
      return await persisteFile;
    } catch (error) {
      this.LoggerAdapter.error({
        message: `Error creating file for authorId: ${fileDto.authorId} with file name: ${fileDto.name}.`,
        where: 'CreateFileService',
      });
      throw this.Exception.internalServerError({
        message: 'File creation failed',
        internalKey: FileExceptions.FILE_UPLOAD_FAILED,
      });
    }
  }
}
