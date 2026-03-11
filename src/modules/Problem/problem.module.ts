import { Module } from '@nestjs/common';
import { ProblemController } from './infra/presentation/problem.controller';
import { GetProblemByIdService } from './application/services/get-problem-by-id.service';
import { CreateProblemService } from '@/modules/Problem/application/services/create-problem.service';
import { GetAllProblemsService } from '@/modules/Problem/application/services/get-all-problens.service';
import { DeleteProblemService } from '@/modules/Problem/application/services/delete-problem.service';
import { UpdateProblemService } from '@/modules/Problem/application/services/update-problem.service';
import { GetAdminProblemByIdService } from '@/modules/Problem/application/services/get-admin-problem-by-id.service';
import { GetAllAdminProblemsService } from '@/modules/Problem/application/services/get-all-admin-problems.service';

@Module({
  controllers: [ProblemController],
  providers: [
    CreateProblemService,
    GetProblemByIdService,
    GetAllProblemsService,
    UpdateProblemService,
    DeleteProblemService,
    GetAdminProblemByIdService,
    GetAllAdminProblemsService,
  ],
})
export class ProblemModule {}
