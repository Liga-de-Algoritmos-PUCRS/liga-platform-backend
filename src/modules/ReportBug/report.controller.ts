import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import { ReportBugServiceDTO, ReportBugDecorator } from './report-bug.dto';
import { ReportBugService } from './report-bug.service';

@Controller('report-bug')
@ApiTags('Report Bug')
export class ReportBugController {
  constructor(private readonly ReportBugService: ReportBugService) {}

  @ReportBugDecorator
  @Post('')
  async reportBug(@GetUser() user, @Body() data: ReportBugServiceDTO): Promise<void> {
    await this.ReportBugService.reportBug(String(user.id), data);
  }
}
