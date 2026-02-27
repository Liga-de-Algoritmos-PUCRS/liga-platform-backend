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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsN8N } from '@/global/common/decorators/n8n.decorator';
import { Public } from '@/global/common/decorators/public.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/global/common/guards/jwt-auth.guard';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { UpdateFileDTO } from '@/modules/File/application/dtos/update-file.dto';
import { ConvertToCreateFileDTO } from '@/modules/File/application/dtos/create-file.dto';
import {
  CreateFileDecorator,
  GetFileByAuthorIdDecorator,
  GetFileByIdDecorator,
  GetFilesByNegociationIdDecorator,
  UpdateFileDecorator,
  DeleteFileDecorator,
} from '@/modules/File/application/dtos/file.decorators';
import { FileReponseDTO } from '@/modules/File/application/dtos/response-file.dto';
import { CreateFileService } from '@/modules/File/application/services/create-file.service';
import { UpdateFileService } from '@/modules/File/application/services/update-file.service';
import { DeleteFileService } from '@/modules/File/application/services/delete-file.service';
import { GetFileByIdService } from '@/modules/File/application/services/get-file-by-id.service';
import { GetFilesByNegociationIdService } from '@/modules/File/application/services/get-file-by-negociation-id.service';
import { GetFilesByAuthorIdService } from '@/modules/File/application/services/get-file-by-author-id.service';
import { CreateFileByN8NRequestService } from '@/modules/File/application/services/create-file-by-n8n-request.service';
import { CreateFileByN8NRequestDTO } from '@/modules/File/application/dtos/create-file-by-n8n-request.dto';
import { CreateFileByN8NRequestDecorator } from '@/modules/File/application/dtos/file.decorators';

@ApiTags('File')
@UseGuards(JwtAuthGuard)
@Controller('file')
export class FileController {
  constructor(
    private readonly CreateFileService: CreateFileService,
    private readonly CreateFileByN8NRequestService: CreateFileByN8NRequestService,
    private readonly UpdateFileService: UpdateFileService,
    private readonly DeleteFileService: DeleteFileService,
    private readonly GetFileByIdService: GetFileByIdService,
    private readonly GetFilesByNegociationIdService: GetFilesByNegociationIdService,
    private readonly GetFilesByAuthorIdService: GetFilesByAuthorIdService,
  ) {}

  @CreateFileDecorator
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }))
  @Post('')
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetUser() user,
    @Body('negociationId') negociationId?: string,
  ): Promise<FileReponseDTO[]> {
    const creationPromises = files.map((file) => {
      const fileDTO = ConvertToCreateFileDTO(file);
      return this.CreateFileService.execute(fileDTO, String(user.id), negociationId);
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

  @GetFilesByNegociationIdDecorator
  @Get('negociation/:negociationId')
  async getFilesByNegociationId(
    @Param('negociationId') negociationId: string,
    @GetUser() user,
  ): Promise<FileReponseDTO[]> {
    return await this.GetFilesByNegociationIdService.execute(negociationId, String(user.id));
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

  @CreateFileByN8NRequestDecorator
  @Post('n8n')
  @IsN8N()
  @Public()
  async createByN8nRequest(@Body() fileDto: CreateFileByN8NRequestDTO): Promise<FileReponseDTO> {
    return await this.CreateFileByN8NRequestService.execute(fileDto);
  }
}
