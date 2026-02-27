import { Module } from '@nestjs/common';
import { ProblemController } from './infra/presentation/problem.controller';
import { GetProblemByIdService } from './application/service/get-problem-by-id.service';
import { CreateProblemService } from '@/modules/Problem/application/service/create-problem.service';
import { GetAllProblemsService } from '@/modules/Problem/application/service/get-all-problens.service';
import { DeleteProblemService } from '@/modules/Problem/application/service/delete-problem.service';
import { UpdateProblemService } from '@/modules/Problem/application/service/update-problem.service';

@Module({
  controllers: [ProblemController],
  providers: [
    CreateProblemService,
    GetProblemByIdService,
    GetAllProblemsService,
    UpdateProblemService,
    DeleteProblemService,
  ],
})
export class ProblemModule {}
