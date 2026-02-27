import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserService } from '@/modules/User/application/services/update-user.service';
import { GetAllUserService } from '@/modules/User/application/services/get-all-user.service';
import { DeleteUserService } from '@/modules/User/application/services/delete-user.service';
import { GetUserByIdService } from '@/modules/User/application/services/get-user.service';
import { UpdateUserDTO } from '@/modules/User/application/dtos/update-user.dto';
import { GetUser } from '@/global/common/decorators/get-user.decorator';
import {
  UpdateUserDecorator,
  GetAllUsersDecorator,
  GetUserDecorator,
  DeleteUserDecorator,
  GetTopUsersDecorator,
  GetMonthlyTopUsersDecorator,
  ResetUserPointsDecorator,
} from '../../application/dtos/user.decorator';
import { UserResponseDTO } from '@/modules/User/application/dtos/response-user.dto';
import { GetTopUserService } from '@/modules/User/application/services/get-top-user.service';
import { GetMonthlyTopUserService } from '@/modules/User/application/services/get-top-monthly-user.service';
import { ResetUserPointsService } from '@/modules/User/application/services/reset-user-points.service';

import { IsAdmin } from '@/global/common/decorators/is-admin-decorator';
import { DeleteUserDTO } from '../../application/dtos/delete-user.dto';
import { Public } from '@/global/common/decorators/public.decorator';
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    private readonly UpdateUserService: UpdateUserService,
    private readonly GetAllUserService: GetAllUserService,
    private readonly GetUser: GetUserByIdService,
    private readonly DeleteUserService: DeleteUserService,
    private readonly GetTopUser: GetTopUserService,
    private readonly GetMonthlyTopUser: GetMonthlyTopUserService,
    private readonly ResetUserPointsService: ResetUserPointsService,
  ) {}

  @Public()
  @GetUserDecorator
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDTO> {
    return await this.GetUser.execute(id);
  }

  @GetAllUsersDecorator
  @IsAdmin()
  @Get()
  async getAllUsers(): Promise<UserResponseDTO[]> {
    return await this.GetAllUserService.execute();
  }

  @UpdateUserDecorator
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDTO) {
    return await this.UpdateUserService.execute(id, user);
  }

  @DeleteUserDecorator
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @GetUser() user, @Body() payload: DeleteUserDTO) {
    return await this.DeleteUserService.execute(id, String(user.id), payload.password);
  }

  @GetTopUsersDecorator
  @Public()
  @Get('top/all-time')
  async getTopUsers(): Promise<UserResponseDTO[]> {
    return await this.GetTopUser.execute();
  }

  @GetMonthlyTopUsersDecorator
  @Public()
  @Get('top/monthly')
  async getMonthlyTopUsers(): Promise<UserResponseDTO[]> {
    return await this.GetMonthlyTopUser.execute();
  }

  @ResetUserPointsDecorator
  @IsAdmin()
  @Post('reset-points')
  async resetUserPoints(@GetUser() user): Promise<UserResponseDTO> {
    return await this.ResetUserPointsService.execute(String(user.id));
  }
}
