import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '@/global/common/decorators/public.decorator';
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
import { RefreshTokenPayload } from '@/global/common/strategies/refresh-token-payload.dto';
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
    @Req() req: Request & { user: RefreshTokenPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    const information = req.user;
    const accountId = information.sub;
    const oldRefreshToken = information.refreshToken;
    const { accessToken, refreshToken } = await this.RefreshTokenService.execute(
      accountId,
      information.jti,
      oldRefreshToken,
    );

    this.SetAuthCookiesService.execute(res, refreshToken);
    return { accessToken };
  }

  @LogoutDecorator
  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.ClearAuthCookiesService.execute(res);
    await this.LogoutService.execute(req.cookies?.['refreshToken'] as string | undefined);
    return { message: 'Logged out successfully' };
  }
}
