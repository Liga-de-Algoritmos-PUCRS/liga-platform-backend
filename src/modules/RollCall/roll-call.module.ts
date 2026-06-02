import { Module } from '@nestjs/common';
import { RollCallController } from './infra/presentation/roll-call.controller';
import { CreateRollCallService } from './application/services/create-roll-call.service';
import { FindAllRollCallsService } from './application/services/find-all-roll-calls.service';
import { FindOneRollCallService } from './application/services/find-one-roll-call.service';
import { GenerateQrCodeService } from './application/services/generate-qr-code.service';
import { AttendRollCallService } from './application/services/attend-roll-call.service';
import { UpdateAttendanceService } from './application/services/update-attendance.service';
import { GetMyAttendancesService } from './application/services/get-my-attendances.service';
import { GetOverviewService } from './application/services/get-overview.service';
import { RemoveRollCallService } from './application/services/remove-roll-call.service';

@Module({
  controllers: [RollCallController],
  providers: [
    CreateRollCallService,
    FindAllRollCallsService,
    FindOneRollCallService,
    GenerateQrCodeService,
    AttendRollCallService,
    UpdateAttendanceService,
    GetMyAttendancesService,
    GetOverviewService,
    RemoveRollCallService,
  ],
})
export class RollCallModule {}
