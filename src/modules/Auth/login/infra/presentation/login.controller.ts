import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '@/global/common/decorators/public.decorator';
import { GetUser, GetUserInterface } from '@/global/common/decorators/get-user.decorator';
import { RefreshTokenGuard } from '@/global/common/guards/refresh-token.guard';
import {
  LoginDecorator,
  LoginRequestDTO,
  LogoutDecorator,
  RefreshTokenDecorator,
} from '@/modules/Auth/login/application/dtos/login.dto';
import { LoginService } from '@/modules/Auth/login/application/services/login.service';
import { RefreshTokenService } from '@/modules/Auth/login/application/services/refresh-tokens.service';
import { LogoutService } from '@/modules/Auth/login/application/services/logout.service';
import { LoginResponseInterface } from '@/modules/Auth/login/application/dtos/refreshToken';
import { SetAuthCookiesService } from '../../application/services/set-auth-cookies.service';
import { ClearAuthCookiesService } from '../../application/services/clear-auth-cookie.service';

@Controller('auth')
@ApiTags('Login')
export class LoginController {
  constructor(
    private readonly LoginService: LoginService,
    private readonly LogoutService: LogoutService,
    private readonly RefreshTokenService: RefreshTokenService,
    private readonly SetAuthCookiesService: SetAuthCookiesService,
    private readonly ClearAuthCookiesService: ClearAuthCookiesService,
  ) {}

  @LoginDecorator
  @Public()
  @Post('login')
  async login(@Body() loginRequest: LoginRequestDTO, @Res({ passthrough: true }) res: Response) {
    const loginResponse: LoginResponseInterface = await this.LoginService.execute(loginRequest);
    const { accessToken, refreshToken } = loginResponse;
    this.SetAuthCookiesService.execute(res, refreshToken);

    return {
      accessToken,
    };
  }

  @RefreshTokenDecorator
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @GetUser() user: GetUserInterface,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.RefreshTokenService.execute(
      user.id,
      user.refreshToken,
    );

    this.SetAuthCookiesService.execute(res, refreshToken);
    return { accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @LogoutDecorator
  @Public()
  @Post('logout')
  async logout(@GetUser() user: GetUserInterface, @Res({ passthrough: true }) res: Response) {
    this.ClearAuthCookiesService.execute(res);
    await this.LogoutService.execute(user.id);
    return { message: 'Logged out successfully' };
  }
}
