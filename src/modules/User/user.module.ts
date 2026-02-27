import { Global, Module } from "@nestjs/common";
import { UserController } from "@/modules/User/infra/presentation/user.controller";
import { UpdateUserService } from "@/modules/User/application/services/update-user.service";
import { GetAllUserService } from "@/modules/User/application/services/get-all-user.service";
import { GetUserByIdService } from "@/modules/User/application/services/get-user.service";
import { DeleteUserService } from "@/modules/User/application/services/delete-user.service";
import { CryptographyModule } from "@/infrastructure/Criptography/criptography.module";
import { GetUserWithAccountService } from "@/modules/User/application/services/get-user-with-account.service";
import { SendEmailModule } from "@/infrastructure/SendEmail/sendEmail.module";

@Global()
@Module({
  imports: [CryptographyModule, SendEmailModule],
  controllers: [UserController],
  providers: [
    UpdateUserService,
    GetAllUserService,
    GetUserByIdService,
    GetUserWithAccountService,
    DeleteUserService,
  ],
  exports: [],
})
export class UserModule {}
