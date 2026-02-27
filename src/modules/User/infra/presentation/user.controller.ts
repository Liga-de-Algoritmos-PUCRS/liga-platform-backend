import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/global/common/guards/jwt-auth.guard";
import { UpdateUserService } from "@/modules/User/application/services/update-user.service";
import { GetAllUserService } from "@/modules/User/application/services/get-all-user.service";
import { DeleteUserService } from "@/modules/User/application/services/delete-user.service";
import { GetUserByIdService } from "@/modules/User/application/services/get-user.service";
import { UpdateUserDTO } from "@/modules/User/application/dtos/update-user.dto";
import { GetUser } from "@/global/common/decorators/get-user.decorator";
import {
  UpdateUserDecorator,
  GetAllUsersDecorator,
  GetUserDecorator,
  DeleteUserDecorator,
} from "../../application/dtos/user.decorator";
import { UserResponseDTO } from "@/modules/User/application/dtos/response-user.dto";

import { IsAdmin } from "@/global/common/decorators/is-admin-decorator";
import { DeleteUserDTO } from "../../application/dtos/delete-user.dto";
@Controller("user")
@UseGuards(JwtAuthGuard)
@ApiTags("User")
export class UserController {
  constructor(
    private readonly UpdateUserService: UpdateUserService,
    private readonly GetAllUserService: GetAllUserService,
    private readonly GetUser: GetUserByIdService,
    private readonly DeleteUserService: DeleteUserService,
  ) {}

  @GetUserDecorator
  @Get(":id")
  async getUserById(@Param("id") id: string): Promise<UserResponseDTO> {
    return await this.GetUser.execute(id);
  }

  @GetAllUsersDecorator
  @IsAdmin()
  @Get()
  async getAllUsers(): Promise<UserResponseDTO[]> {
    return await this.GetAllUserService.execute();
  }

  @UpdateUserDecorator
  @Patch(":id")
  async updateUser(@Param("id") id: string, @Body() user: UpdateUserDTO) {
    return await this.UpdateUserService.execute(id, user);
  }

  @DeleteUserDecorator
  @Delete(":id")
  async deleteUser(
    @Param("id") id: string,
    @GetUser() user,
    @Body() payload: DeleteUserDTO,
  ) {
    return await this.DeleteUserService.execute(
      id,
      String(user.id),
      payload.password,
    );
  }
}
