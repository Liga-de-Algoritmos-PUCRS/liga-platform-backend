import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProblemService } from '@/modules/Problem/application/services/create-problem.service';
import { GetProblemByIdService } from '@/modules/Problem/application/services/get-problem-by-id.service';
import { GetAllProblemsService } from '@/modules/Problem/application/services/get-all-problens.service';
import { DeleteProblemService } from '@/modules/Problem/application/services/delete-problem.service';
import { UpdateProblemService } from '@/modules/Problem/application/services/update-problem.service';
import { GetAdminProblemByIdService } from '@/modules/Problem/application/services/get-admin-problem-by-id.service';
import { GetAllAdminProblemsService } from '@/modules/Problem/application/services/get-all-admin-problems.service';

import { UpdateProblemDTO } from '@/modules/Problem/application/dtos/update-problem.dto';
import {
  ProblemResponseDTO,
  PublicProblemResponseDTO,
} from '@/modules/Problem/application/dtos/problem.response';
import { Public } from '@/global/common/decorators/public.decorator';
import { CreateProblemDTO } from '@/modules/Problem/application/dtos/create-problem.dto';
import {
  CreateProblemDecorator,
  GetProblemByIdDecorator,
  GetAllProblemsDecorator,
  UpdateProblemDecorator,
  DeleteProblemDecorator,
  GetAdminProblemByIdDecorator,
  GetAllAdminProblemsDecorator,
} from '@/modules/Problem/application/dtos/problem.decorator';
import { IsAdmin } from '@/global/common/decorators/is-admin-decorator';

@Controller('problems')
@ApiTags('Problems')
export class ProblemController {
  constructor(
    private readonly CreateProblemService: CreateProblemService,
    private readonly GetProblemByIdService: GetProblemByIdService,
    private readonly GetAllAdminProblemsService: GetAllAdminProblemsService,
    private readonly UpdateProblemService: UpdateProblemService,
    private readonly GetAllProblemsService: GetAllProblemsService,
    private readonly DeleteProblemService: DeleteProblemService,
    private readonly GetAdminProblemByIdService: GetAdminProblemByIdService,
  ) {}

  // Fica no topo junto com a outra rota de admin. Nao ha conflito de captura
  // com @Get(':id') nem com @Get(':id/admin'): 'admin/all' tem dois segmentos
  // fixos, e nenhum dos dois padroes casa com esse caminho.
  @IsAdmin()
  @GetAllAdminProblemsDecorator
  @Get('admin/all')
  async getAllAdminProblems(): Promise<ProblemResponseDTO[]> {
    return await this.GetAllAdminProblemsService.execute();
  }

  @IsAdmin()
  @GetAdminProblemByIdDecorator
  @Get(':id/admin')
  async getAdminProblemById(@Param('id') id: string): Promise<ProblemResponseDTO> {
    return await this.GetAdminProblemByIdService.execute(id);
  }

  @Public()
  @GetProblemByIdDecorator
  @Get(':id')
  async getProblemById(@Param('id') id: string): Promise<PublicProblemResponseDTO> {
    return await this.GetProblemByIdService.execute(id);
  }

  @Public()
  @GetAllProblemsDecorator
  @Get()
  async getAllProblems(): Promise<PublicProblemResponseDTO[]> {
    return await this.GetAllProblemsService.execute();
  }

  @IsAdmin()
  @CreateProblemDecorator
  @Post()
  async createProblem(@Body() CreateProblemDTO: CreateProblemDTO) {
    return await this.CreateProblemService.execute(CreateProblemDTO);
  }

  @IsAdmin()
  @UpdateProblemDecorator
  @Patch(':id')
  async updateProblem(@Param('id') id: string, @Body() UpdateProblemDTO: UpdateProblemDTO) {
    return await this.UpdateProblemService.execute(id, UpdateProblemDTO);
  }

  @IsAdmin()
  @DeleteProblemDecorator
  @Delete(':id')
  async deleteProblem(@Param('id') id: string) {
    return await this.DeleteProblemService.execute(id);
  }
}
