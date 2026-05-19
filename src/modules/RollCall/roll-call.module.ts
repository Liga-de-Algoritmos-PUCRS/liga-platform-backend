import { Module } from '@nestjs/common';
import { RollCallService } from './roll-call.service';
import { RollCallController } from './roll-call.controller';
import { PrismaService } from '@/infrastructure/Database/prisma.service';

@Module({
  controllers: [RollCallController],
  providers: [RollCallService, PrismaService],
})
export class RollCallModule {}
