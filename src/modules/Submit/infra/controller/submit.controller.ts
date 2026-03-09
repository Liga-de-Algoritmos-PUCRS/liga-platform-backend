import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubmitService } from '@/modules/Submit/application/services/create-submit.service';
import { GetSubmitByProblemIdService } from '@/modules/Submit/application/services/get-submit-by-problem-id.service';
import { GetSubmitByUserIdService } from '@/modules/Submit/application/services/get-submit-by-user-id.service';
import { GetAllSubmitsService } from '@/modules/Submit/application/services/get-all-submits.service';
import { SubmitResponseDTO } from '@/modules/Submit/application/dtos/submit-response.dto';
import { DeleteSubmitService } from '@/modules/Submit/application/services/delete-submit.service';
import { CreateSubmitDTO } from '@/modules/Submit/application/dtos/create-submit.dto';
import {
  CreateSubmitDecorator,
  GetSubmitByProblemIdDecorator,
  GetSubmitByUserIdDecorator,
  GetAllSubmitsDecorator,
  DeleteSubmitDecorator,
} from '@/modules/Submit/application/dtos/submit.decorator';
import { IsAdmin } from '@/global/common/decorators/is-admin-decorator';
import { GetUser } from '@/global/common/decorators/get-user.decorator';

@Controller('submit')
@ApiTags('Submit')
export class SubmitController {
  constructor(
    private readonly CreateSubmitService: CreateSubmitService,
    private readonly GetSubmitByProblemIdService: GetSubmitByProblemIdService,
    private readonly GetSubmitByUserIdService: GetSubmitByUserIdService,
    private readonly GetAllSubmitsService: GetAllSubmitsService,
    private readonly DeleteSubmitService: DeleteSubmitService,
  ) {}

  @CreateSubmitDecorator
  @Post()
  async createSubmit(@Body() submit: CreateSubmitDTO, @GetUser() user): Promise<SubmitResponseDTO> {
    return await this.CreateSubmitService.execute(submit, String(user.id));
  }

  @GetSubmitByProblemIdDecorator
  @Get(':problemId')
  async getSubmitByProblemId(@Param('problemId') problemId: string): Promise<SubmitResponseDTO[]> {
    return await this.GetSubmitByProblemIdService.execute(problemId);
  }

  @GetSubmitByUserIdDecorator
  @Get('user/:userId')
  async getSubmitByUserId(@Param('userId') userId: string): Promise<SubmitResponseDTO[]> {
    return await this.GetSubmitByUserIdService.execute(userId);
  }

  @GetAllSubmitsDecorator
  @IsAdmin()
  @Get()
  async getAllSubmits(): Promise<SubmitResponseDTO[]> {
    return await this.GetAllSubmitsService.execute();
  }

  @DeleteSubmitDecorator
  @IsAdmin()
  @Delete(':id')
  async deleteSubmit(@Param('id') id: string): Promise<void> {
    return await this.DeleteSubmitService.execute(id);
  }
}
