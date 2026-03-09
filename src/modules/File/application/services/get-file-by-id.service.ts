import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { BucketAdapter } from '@/infrastructure/Bucket/bucket.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { File } from '@/modules/File/domain/file.entity';
import { FileExceptions, UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';
import { UserRepository } from '@/modules/User/domain/user.repository';

@Injectable()
export class GetFileByIdService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly FileRepository: FileRepository,
    private readonly BucketAdapter: BucketAdapter,
    private readonly Exception: ExceptionsAdapter,
  ) {}

  async execute(id: string, userId: string): Promise<File | null> {
    const file = await this.FileRepository.getFileById(id);
    if (!file) {
      throw this.Exception.notFound({
        message: 'File not found',
        internalKey: FileExceptions.FILE_NOT_FOUND,
      });
    }
    if (file.deleted) {
      throw this.Exception.badRequest({
        message: 'File already deleted',
        internalKey: FileExceptions.FILE_ALREADY_DELETED,
      });
    }
    const author = await this.UserRepository.findUserById(file.authorId);
    if (!author) {
      throw this.Exception.notFound({
        message: 'Author not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }
    const authorNegociations = await this.UserRepository.findUserById(userId);
    if (!authorNegociations) {
      throw this.Exception.notFound({
        message: 'User not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }
    file.fileUrl = this.BucketAdapter.getFileUrl(file.fileUrl);
    return file;
  }
}
