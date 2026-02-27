import { Injectable } from "@nestjs/common";
import { FileRepository } from "@/modules/File/domain/file.repository";
import { BucketAdapter } from "@/infrastructure/Bucket/bucket.adapter";
import { ExceptionsAdapter } from "@/infrastructure/Exceptions/exceptions.adapter";
import { FileExceptions } from "@/infrastructure/Exceptions/exceptions.types";
import { TransactionAdapter } from "@/infrastructure/Database/Transaction/transaction.adapter";
import { LoggerAdapter } from "@/infrastructure/Logger/logger.adapter";

@Injectable()
export class DeleteFileService {
  constructor(
    private readonly FileRepository: FileRepository,
    private readonly BucketAdapter: BucketAdapter,
    private readonly Exception: ExceptionsAdapter,
    private readonly LoggerAdapter: LoggerAdapter,
    private readonly TransactionAdapter: TransactionAdapter,
  ) {}

  async execute(id: string): Promise<void> {
    const file = await this.FileRepository.getFileById(id);

    if (!file) {
      throw this.Exception.notFound({
        message: "No file found",
        internalKey: FileExceptions.FILE_NOT_FOUND,
      });
    }
    if (file.deleted) {
      throw this.Exception.badRequest({
        message: "File already deleted",
        internalKey: FileExceptions.FILE_ALREADY_DELETED,
      });
    }

    return this.TransactionAdapter.transaction(async () => {
      try {
        await this.BucketAdapter.deleteFile(file.fileUrl);
      } catch (error) {
        this.LoggerAdapter.error({
          where: "DeleteFileService",
          message: `Error deleting file from storage for file ID: ${id}, URL: ${file.fileUrl}. Error: ${error}`,
        });
        throw this.Exception.internalServerError({
          message: "Failed to delete file from storage",
          internalKey: FileExceptions.FILE_UPLOAD_FAILED,
        });
      }
      await this.FileRepository.deleteFile(id);
    });
  }
}
