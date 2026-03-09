import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProblemService } from '@/modules/Problem/application/services/create-problem.service';
import { GetProblemByIdService } from '@/modules/Problem/application/services/get-problem-by-id.service';
import { GetAllProblemsService } from '@/modules/Problem/application/services/get-all-problens.service';
import { DeleteProblemService } from '@/modules/Problem/application/services/delete-problem.service';
import { UpdateProblemService } from '@/modules/Problem/application/services/update-problem.service';
import { UpdateProblemDTO } from '@/modules/Problem/application/dtos/update-problem.dto';
import { ProblemResponseDTO } from '@/modules/Problem/application/dtos/problem.response';
import { Public } from '@/global/common/decorators/public.decorator';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { CreateProblemDTO } from '@/modules/Problem/application/dtos/create-problem.dto';
import {
  CreateProblemDecorator,
  GetProblemByIdDecorator,
  GetAllProblemsDecorator,
  UpdateProblemDecorator,
  DeleteProblemDecorator,
} from '@/modules/Problem/application/dtos/problem.decorator';
import { IsAdmin } from '@/global/common/decorators/is-admin-decorator';

@Controller('problems')
@ApiTags('Problems')
export class ProblemController {
  constructor(
    private readonly CreateProblemService: CreateProblemService,
    private readonly GetProblemByIdService: GetProblemByIdService,
    private readonly UpdateProblemService: UpdateProblemService,
    private readonly GetAllProblemsService: GetAllProblemsService,
    private readonly DeleteProblemService: DeleteProblemService,
  ) {}

  @Public()
  @GetProblemByIdDecorator
  @Get(':id')
  async getProblemById(@Param('id') id: string): Promise<ProblemResponseDTO> {
    return await this.GetProblemByIdService.execute(id);
  }

  @Public()
  @GetAllProblemsDecorator
  @Get()
  async getAllProblems(): Promise<ProblemResponseDTO[]> {
    return await this.GetAllProblemsService.execute();
  }

  @IsAdmin()
  @CreateProblemDecorator
  @Post()
  async createProblem(@Body() CreateProblemDTO: CreateProblemDTO, @GetUser() user) {
    return await this.CreateProblemService.execute(CreateProblemDTO, String(user.id));
  }

  @IsAdmin()
  @UpdateProblemDecorator
  @Patch(':id')
  async updateProblem(
    @Param('id') id: string,
    @Body() UpdateProblemDTO: UpdateProblemDTO,
    @GetUser() user,
  ) {
    return await this.UpdateProblemService.execute(id, UpdateProblemDTO, String(user.id));
  }

  @IsAdmin()
  @DeleteProblemDecorator
  @Delete(':id')
  async deleteProblem(@Param('id') id: string, @GetUser() user) {
    return await this.DeleteProblemService.execute(id, String(user.id));
  }
}
