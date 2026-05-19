import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RollCallService } from './roll-call.service';
import { CreateRollCallDto } from './dto/create-roll-call.dto';
import { AttendRollCallDto } from './dto/attend-roll-call.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '@/global/common/guards/jwt-auth.guard';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RollCall')
@UseGuards(JwtAuthGuard)
@Controller('roll-calls')
export class RollCallController {
  constructor(private readonly rollCallService: RollCallService) {}

  @Post()
  create(@Body() createRollCallDto: CreateRollCallDto) {
    // Ideally this should check for Admin role, but adding it based on standard guards
    return this.rollCallService.create(createRollCallDto);
  }

  @Get()
  findAll() {
    return this.rollCallService.findAll();
  }

  @Get('overview')
  getOverview() {
    return this.rollCallService.getOverview();
  }

  @Get('my-attendances')
  getMyAttendances(@GetUser() user) {
    return this.rollCallService.getMyAttendances(String(user.id));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rollCallService.findOne(id);
  }

  @Get(':id/qr-code')
  generateQrCode(@Param('id') id: string) {
    return this.rollCallService.generateQrCode(id);
  }

  @Post('attend')
  attend(@GetUser() user, @Body() attendRollCallDto: AttendRollCallDto) {
    return this.rollCallService.attend(String(user.id), attendRollCallDto);
  }

  @Patch(':id/attendance')
  updateAttendance(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.rollCallService.updateAttendance(id, updateAttendanceDto);
  }
}
