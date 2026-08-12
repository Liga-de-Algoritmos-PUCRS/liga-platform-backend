import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { BucketAdapter } from '@/infrastructure/Bucket/bucket.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { File } from '@/modules/File/domain/file.entity';
import { FileExceptions, UserExceptions } from '@/infrastructure/Exceptions/exceptions.types';

@Injectable()
export class GetFileByIdService {
  constructor(
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
    // Mesma regra do GetFilesByAuthorIdService e do UpdateFileService: arquivo
    // e do autor. Antes daqui saiam duas buscas ao banco -- o autor e o
    // requester -- que nunca eram comparadas entre si.
    if (file.authorId !== userId) {
      throw this.Exception.forbidden({
        message: "User doesn't have permission",
        internalKey: UserExceptions.USER_NOT_ALLOWED,
      });
    }
    file.fileUrl = this.BucketAdapter.getFileUrl(file.fileUrl);
    return file;
  }
}
