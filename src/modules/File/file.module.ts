import { Module } from '@nestjs/common';
import { FileController } from '@/modules/File/infra/presentation/file.controller';
import { CreateFileService } from '@/modules/File//application/services/create-file.service';
import { GetFileByIdService } from '@/modules/File//application/services/get-file-by-id.service';
import { GetFilesByAuthorIdService } from '@/modules/File//application/services/get-file-by-author-id.service';
import { GetFilesByNegociationIdService } from '@/modules/File//application/services/get-file-by-negociation-id.service';
import { UpdateFileService } from '@/modules/File//application/services/update-file.service';
import { DeleteFileService } from '@/modules/File//application/services/delete-file.service';
import { CreateFileByN8NRequestService } from '@/modules/File/application/services/create-file-by-n8n-request.service';

@Module({
  imports: [],
  controllers: [FileController],
  providers: [
    CreateFileService,
    CreateFileByN8NRequestService,
    GetFileByIdService,
    GetFilesByAuthorIdService,
    GetFilesByNegociationIdService,
    UpdateFileService,
    DeleteFileService,
  ],
  exports: [CreateFileService, GetFileByIdService, GetFilesByAuthorIdService, UpdateFileService],
})
export class FileModule {}
