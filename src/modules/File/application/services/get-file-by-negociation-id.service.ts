import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/modules/File/domain/file.repository';
import { AccountRepository } from '@/modules/Account/domain/account.repository';
import { BucketAdapter } from '@/infrastructure/Bucket/bucket.adapter';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { File } from '@/modules/File/domain/file.entity';
import { NegociationRepository } from '@/modules/Negociation/domain/negociation.repository';

@Injectable()
export class GetFilesByNegociationIdService {
  constructor(
    private readonly AccountRepository: AccountRepository,
    private readonly FileRepository: FileRepository,
    private readonly NegociationRepository: NegociationRepository,
    private readonly BucketAdapter: BucketAdapter,
    private readonly Exception: ExceptionsAdapter,
  ) {}

  async execute(negociationId: string, userId: string): Promise<File[]> {
    const negociation = await this.NegociationRepository.getNegociationById(negociationId);
    if (!negociation) {
      throw this.Exception.notFound({
        message: 'Negociation not found',
      });
    }
    const author = await this.AccountRepository.getAccountById(userId);
    if (!author) {
      throw this.Exception.notFound({
        message: 'User not found',
      });
    }
    if (negociation.negociation.workspaceId !== author.workspaceId) {
      throw this.Exception.forbidden({
        message: "User doesn't have permission",
      });
    }
    const files = await this.FileRepository.getFilesByNegociationId(negociationId);
    const filteredFiles = files.filter((file) => !file.deleted);

    filteredFiles.forEach((file) => {
      if (file.fileUrl) {
        file.fileUrl = this.BucketAdapter.getSignedUrlForInternalRead(file.fileUrl);
      }
    });

    return filteredFiles;
  }
}
