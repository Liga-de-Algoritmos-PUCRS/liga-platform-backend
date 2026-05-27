import { Controller, Get, Post, Body, Patch, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/global/common/guards/jwt-auth.guard';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { IsAdmin } from '@/global/common/decorators/is-admin-decorator';
import { CreateRollCallDto } from '../../application/dtos/create-roll-call.dto';
import { AttendRollCallDto } from '../../application/dtos/attend-roll-call.dto';
import { UpdateAttendanceDto } from '../../application/dtos/update-attendance.dto';
import { CreateRollCallService } from '../../application/services/create-roll-call.service';
import { FindAllRollCallsService } from '../../application/services/find-all-roll-calls.service';
import { FindOneRollCallService } from '../../application/services/find-one-roll-call.service';
import { GenerateQrCodeService } from '../../application/services/generate-qr-code.service';
import { AttendRollCallService } from '../../application/services/attend-roll-call.service';
import { UpdateAttendanceService } from '../../application/services/update-attendance.service';
import { GetMyAttendancesService } from '../../application/services/get-my-attendances.service';
import { GetOverviewService } from '../../application/services/get-overview.service';
import { RemoveRollCallService } from '../../application/services/remove-roll-call.service';

@ApiTags('RollCall')
@UseGuards(JwtAuthGuard)
@Controller('roll-calls')
export class RollCallController {
  constructor(
    private readonly createRollCallService: CreateRollCallService,
    private readonly findAllRollCallsService: FindAllRollCallsService,
    private readonly findOneRollCallService: FindOneRollCallService,
    private readonly generateQrCodeService: GenerateQrCodeService,
    private readonly attendRollCallService: AttendRollCallService,
    private readonly updateAttendanceService: UpdateAttendanceService,
    private readonly getMyAttendancesService: GetMyAttendancesService,
    private readonly getOverviewService: GetOverviewService,
    private readonly removeRollCallService: RemoveRollCallService,
  ) {}

  @Post()
  @IsAdmin()
  create(@Body() dto: CreateRollCallDto) {
    return this.createRollCallService.execute(new Date(dto.date));
  }

  @Get()
  @IsAdmin()
  findAll() {
    return this.findAllRollCallsService.execute();
  }

  @Get('overview')
  @IsAdmin()
  getOverview() {
    return this.getOverviewService.execute();
  }

  @Get('my-attendances')
  getMyAttendances(@GetUser() user) {
    return this.getMyAttendancesService.execute(String(user.id));
  }

  @Get(':id')
  @IsAdmin()
  findOne(@Param('id') id: string) {
    return this.findOneRollCallService.execute(id);
  }

  @Get(':id/qr-code')
  @IsAdmin()
  generateQrCode(@Param('id') id: string) {
    return this.generateQrCodeService.execute(id);
  }

  @Post('attend')
  attend(@GetUser() user, @Body() dto: AttendRollCallDto) {
    return this.attendRollCallService.execute(String(user.id), dto.uuid);
  }

  @Patch(':id/attendance')
  @IsAdmin()
  updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.updateAttendanceService.execute(id, dto.userId, dto.isPresent);
  }

  @Delete(':id')
  @IsAdmin()
  remove(@Param('id') id: string) {
    return this.removeRollCallService.execute(id);
  }
}
