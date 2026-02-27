import { Global, Module } from '@nestjs/common';
import { UserController } from '@/modules/User/infra/presentation/user.controller';
import { UpdateUserService } from '@/modules/User/application/services/update-user.service';
import { GetAllUserService } from '@/modules/User/application/services/get-all-user.service';
import { GetUserByIdService } from '@/modules/User/application/services/get-user.service';
import { DeleteUserService } from '@/modules/User/application/services/delete-user.service';
import { CryptographyModule } from '@/infrastructure/Criptography/criptography.module';
import { GetTopUserService } from '@/modules/User/application/services/get-top-user.service';
import { GetMonthlyTopUserService } from '@/modules/User/application/services/get-top-monthly-user.service';
import { ResetUserPointsService } from '@/modules/User/application/services/reset-user-points.service';
import { SendEmailModule } from '@/infrastructure/SendEmail/sendEmail.module';

@Global()
@Module({
  imports: [CryptographyModule, SendEmailModule],
  controllers: [UserController],
  providers: [
    UpdateUserService,
    GetAllUserService,
    GetUserByIdService,
    DeleteUserService,
    GetTopUserService,
    GetMonthlyTopUserService,
    ResetUserPointsService,
  ],
  exports: [],
})
export class UserModule {}
