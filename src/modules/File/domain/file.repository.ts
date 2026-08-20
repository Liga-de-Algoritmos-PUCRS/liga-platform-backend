import { File } from './file.entity';
import { FileInterface } from '@/modules/File/domain/file.entity';
import { Injectable } from '@nestjs/common';
import { Transaction } from '@/infrastructure/Database/Transaction/transaction.adapter';

@Injectable()
export abstract class FileRepository {
  abstract createFile(file: File, tx?: Transaction): Promise<File>;
  abstract getFileById(id: string): Promise<File | null>;
  abstract getFileByFileUrl(fileUrl: string): Promise<File | null>;
  abstract getFilesByAuthorId(authorId: string): Promise<File[]>;
  abstract updateFile(file: FileInterface, id: string, tx?: Transaction): Promise<File>;
  abstract deleteFile(id: string, tx?: Transaction): Promise<void | boolean>;
}
