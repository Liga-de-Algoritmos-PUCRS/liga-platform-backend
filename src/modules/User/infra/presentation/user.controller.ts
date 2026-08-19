import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserService } from '@/modules/User/application/services/update-user.service';
import { GetAllUserService } from '@/modules/User/application/services/get-all-user.service';
import { GetMembersService } from '@/modules/User/application/services/get-members.service';
import { DeleteUserService } from '@/modules/User/application/services/delete-user.service';
import { GetUserByIdService } from '@/modules/User/application/services/get-user.service';
import { UpdateUserDTO } from '@/modules/User/application/dtos/update-user.dto';
import { AdjustUserPointsDTO } from '@/modules/User/application/dtos/adjust-user-points.dto';
import { GetUser, GetUserInterface } from '@/global/common/decorators/get-user.decorator';
import {
  UpdateUserDecorator,
  GetAllUsersDecorator,
  GetUserDecorator,
  DeleteUserDecorator,
  GetTopUsersDecorator,
  GetMonthlyTopUsersDecorator,
  ResetUserPointsDecorator,
  GetUserInformations,
  GetMembersDecorator,
  AdjustUserPointsDecorator,
} from '../../application/dtos/user.decorator';
import { UserResponseDTO } from '@/modules/User/application/dtos/response-user.dto';
import { PublicUserResponseDTO } from '@/modules/User/application/dtos/public-user.response.dto';
import { GetTopUserService } from '@/modules/User/application/services/get-top-user.service';
import { GetMonthlyTopUserService } from '@/modules/User/application/services/get-top-monthly-user.service';
import { ResetUserPointsService } from '@/modules/User/application/services/reset-user-points.service';
import { AdjustUserPointsService } from '@/modules/User/application/services/adjust-user-points.service';

import { IsAdmin } from '@/global/common/decorators/is-admin-decorator';
import { DeleteUserDTO } from '../../application/dtos/delete-user.dto';
import { Public } from '@/global/common/decorators/public.decorator';
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    private readonly UpdateUserService: UpdateUserService,
    private readonly GetAllUserService: GetAllUserService,
    private readonly GetMembersService: GetMembersService,
    private readonly GetUser: GetUserByIdService,
    private readonly DeleteUserService: DeleteUserService,
    private readonly GetTopUser: GetTopUserService,
    private readonly GetMonthlyTopUser: GetMonthlyTopUserService,
    private readonly ResetUserPointsService: ResetUserPointsService,
    private readonly AdjustUserPointsService: AdjustUserPointsService,
  ) {}

  // Precisa vir antes de @Get(':id'): 'members' e um unico segmento e seria
  // capturado por :id se a ordem fosse invertida.
  @GetMembersDecorator
  @Get('members')
  async getMembers(): Promise<PublicUserResponseDTO[]> {
    return await this.GetMembersService.execute();
  }

  @Public()
  @GetUserDecorator
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<PublicUserResponseDTO> {
    const user = await this.GetUser.execute(id);
    // Rota @Public(): devolve o payload sem email nem role. O mesmo service
    // atende /user/me/:id, que e o proprio dono e recebe o payload completo.
    return user.toPublicJSON();
  }

  @GetUserInformations
  @Get('me/:id')
  async getMe(@GetUser() user): Promise<UserResponseDTO> {
    return await this.GetUser.execute(String(user.id));
  }

  @GetAllUsersDecorator
  @IsAdmin()
  @Get()
  async getAllUsers(): Promise<UserResponseDTO[]> {
    return await this.GetAllUserService.execute();
  }

  @UpdateUserDecorator
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDTO,
    @GetUser() requester: GetUserInterface,
  ) {
    return await this.UpdateUserService.execute(id, user, requester);
  }

  @AdjustUserPointsDecorator
  @IsAdmin()
  @Patch(':id/points')
  async adjustUserPoints(
    @Param('id') id: string,
    @Body() dto: AdjustUserPointsDTO,
    @GetUser() requester: GetUserInterface,
  ): Promise<UserResponseDTO> {
    return await this.AdjustUserPointsService.execute(id, dto, requester);
  }

  @DeleteUserDecorator
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @GetUser() user, @Body() payload: DeleteUserDTO) {
    return await this.DeleteUserService.execute(id, String(user.id), payload.password);
  }

  @GetTopUsersDecorator
  @Public()
  @Get('top/all-time')
  async getTopUsers(): Promise<PublicUserResponseDTO[]> {
    return await this.GetTopUser.execute();
  }

  @GetMonthlyTopUsersDecorator
  @Public()
  @Get('top/monthly')
  async getMonthlyTopUsers(): Promise<PublicUserResponseDTO[]> {
    return await this.GetMonthlyTopUser.execute();
  }

  @ResetUserPointsDecorator
  @IsAdmin()
  @Post('reset-points')
  async resetUserPoints(@GetUser() user): Promise<UserResponseDTO> {
    return await this.ResetUserPointsService.execute(String(user.id));
  }
}
