import { Module } from '@nestjs/common';
import { SubmitController } from '@/modules/Submit/infra/controller/submit.controller';
import { CreateSubmitService } from '@/modules/Submit/application/services/create-submit.service';
import { GetSubmitByProblemIdService } from '@/modules/Submit/application/services/get-submit-by-problem-id.service';
import { GetSubmitByUserIdService } from '@/modules/Submit/application/services/get-submit-by-user-id.service';
import { GetAllSubmitsService } from '@/modules/Submit/application/services/get-all-submits.service';
import { DeleteSubmitService } from '@/modules/Submit/application/services/delete-submit.service';

@Module({
  controllers: [SubmitController],
  providers: [
    CreateSubmitService,
    GetSubmitByProblemIdService,
    GetSubmitByUserIdService,
    GetAllSubmitsService,
    DeleteSubmitService,
  ],
})
export class SubmitModule {}
