import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { UpdateFileDTO } from '@/modules/File/application/dtos/update-file.dto';
import { ConvertToCreateFileDTO } from '@/modules/File/application/dtos/create-file.dto';
import {
  CreateFileDecorator,
  GetFileByAuthorIdDecorator,
  GetFileByIdDecorator,
  UpdateFileDecorator,
  DeleteFileDecorator,
  MAX_FILES,
  MAX_FILE_SIZE_MB,
  ALLOWED_IMAGE_MIME_TYPES,
} from '@/modules/File/application/dtos/file.decorators';
import { FileReponseDTO } from '@/modules/File/application/dtos/response-file.dto';
import { CreateFileService } from '@/modules/File/application/services/create-file.service';
import { UpdateFileService } from '@/modules/File/application/services/update-file.service';
import { DeleteFileService } from '@/modules/File/application/services/delete-file.service';
import { GetFileByIdService } from '@/modules/File/application/services/get-file-by-id.service';
import { GetFilesByAuthorIdService } from '@/modules/File/application/services/get-file-by-author-id.service';
import { ExceptionsAdapter } from '@/infrastructure/Exceptions/exceptions.adapter';
import { FileExceptions } from '@/infrastructure/Exceptions/exceptions.types';

// Sem @UseGuards(JwtAuthGuard) aqui: o guard e APP_GUARD global e nenhuma
// rota deste controller e @Public(), entao repeti-lo so dobrava a verificacao.
@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(
    private readonly CreateFileService: CreateFileService,
    private readonly UpdateFileService: UpdateFileService,
    private readonly DeleteFileService: DeleteFileService,
    private readonly GetFileByIdService: GetFileByIdService,
    private readonly GetFilesByAuthorIdService: GetFilesByAuthorIdService,
    private readonly Exception: ExceptionsAdapter,
  ) {}

  @CreateFileDecorator
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        cb(
          null,
          ALLOWED_IMAGE_MIME_TYPES.includes(
            file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
          ),
        );
      },
    }),
  )
  @Post('')
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetUser() user,
  ): Promise<FileReponseDTO[]> {
    if (!files || files.length === 0) {
      throw this.Exception.badRequest({
        message: `Tipo de arquivo inválido. Tipos permitidos: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}.`,
        internalKey: FileExceptions.FILE_INVALID_TYPE,
      });
    }
    const creationPromises = files.map((file) => {
      const fileDTO = ConvertToCreateFileDTO(file);
      return this.CreateFileService.execute(fileDTO, String(user.id));
    });
    return await Promise.all(creationPromises);
  }

  @GetFileByIdDecorator
  @Get(':id')
  async getFileById(@Param('id') id: string, @GetUser() user): Promise<FileReponseDTO | null> {
    return await this.GetFileByIdService.execute(id, String(user.id));
  }

  @GetFileByAuthorIdDecorator
  @Get('user/:userId')
  async getFilesByAuthorId(
    @Param('userId') userId: string,
    @GetUser() user,
  ): Promise<FileReponseDTO[]> {
    return await this.GetFilesByAuthorIdService.execute(userId, String(user.id));
  }

  @UpdateFileDecorator
  @Patch('')
  async updateFile(@GetUser() user, @Body() file: UpdateFileDTO): Promise<FileReponseDTO> {
    return await this.UpdateFileService.execute(file, String(user.id));
  }

  @DeleteFileDecorator
  @Delete(':id')
  async deleteFile(@Param('id') id: string, @GetUser() user): Promise<void> {
    return await this.DeleteFileService.execute(id, String(user.id));
  }
}
