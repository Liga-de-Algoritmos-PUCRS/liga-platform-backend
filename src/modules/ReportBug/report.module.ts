import { ReportBugController } from './report.controller';
import { ReportBugService } from './report-bug.service';
import { SendEmailModule } from '@/infrastructure/SendEmail/sendEmail.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SendEmailModule],
  controllers: [ReportBugController],
  providers: [ReportBugService],
})
export class ReportBugModule {}
