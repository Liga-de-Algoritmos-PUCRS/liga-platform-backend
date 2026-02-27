import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { BucketAdapter } from '@/infrastructure/Bucket/bucket.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';
import { File } from '@/modules/File/domain/file.entity';
import { FileExceptions, UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';

@Injectable()
export class GetFileByIdService {
  constructor(
    private readonly FileRepository: FileRepository,
    private readonly AccountRepository: AccountRepository,
    private readonly NegociationRepository: NegociationRepository,
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
    const author = await this.AccountRepository.getAccountById(file.authorId);
    if (!author) {
      throw this.Exception.notFound({
        message: 'Author not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }
    const authorNegociations = await this.AccountRepository.getAccountById(userId);
    if (!authorNegociations) {
      throw this.Exception.notFound({
        message: 'User not found',
        internalKey: UserExceptions.USER_NOT_FOUND,
      });
    }
    if (author.workspaceId !== authorNegociations.workspaceId) {
      throw this.Exception.forbidden({
        message: "User doesn't have permission",
        internalKey: UserExceptions.USER_NOT_ALLOWED,
      });
    }

    file.fileUrl = this.BucketAdapter.getSignedUrlForInternalRead(file.fileUrl);

    return file;
  }
}
