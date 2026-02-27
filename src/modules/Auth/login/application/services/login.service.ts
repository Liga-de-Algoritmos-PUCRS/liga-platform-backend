import { Injectable } from "@nestjs/common";
import {
  TokensResponseInterface,
  LoginResponseInterface,
} from "@/modules/Auth/login/application/dtos/refreshToken";
import { RefreshToken } from "@/modules/Auth/login/domain/refresh-token.entity";
import { RefreshTokenRepository } from "@/modules/Auth/login/domain/refresh-token.repository";
import { UserRepository } from "@/modules/User/domain/user.repository";
import { ExceptionsAdapter } from "@/infrastructure/Exceptions/exceptions.adapter";
import { CryptographyAdapter } from "@/infrastructure/Criptography/cryptography.adapter";
import { JwtService } from "@nestjs/jwt";
import { StringValue } from "ms";
import * as ms from "ms";
import { LoginRequestDTO } from "@/modules/Auth/login/application/dtos/login.dto";
import { Role } from "@/modules/User/domain/user.entity";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/global/env.schema";
import { UserExceptions } from "@/infrastructure/Exceptions/exceptions.types";

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly exceptionsAdapter: ExceptionsAdapter,
    private readonly cryptographyAdapter: CryptographyAdapter,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async execute(
    loginRequest: LoginRequestDTO,
  ): Promise<LoginResponseInterface> {
    const { email, password } = loginRequest;

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw this.exceptionsAdapter.badRequest({
        message: "Invalid email or password",
        internalKey: UserExceptions.USER_INVALID_CREDENTIALS,
      });
    }

    const verifyPassword = await this.cryptographyAdapter.compare({
      plainText: password,
      cryptographedText: user.password,
    });

    if (!verifyPassword) {
      throw this.exceptionsAdapter.badRequest({
        message: "Invalid email or password",
      });
    }

    return {
      ...(await this.generateNewTokens({
        accountId: user.id,
        userRole: user.role,
      })),
      userId: user.id,
    };
  }

  private async generateNewTokens(
    tokenParams: TokenParams,
  ): Promise<TokensResponseInterface> {
    const payload = {
      sub: tokenParams.accountId,
      userRole: tokenParams.userRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: this.configService.get<string>(
          "ACCESS_TOKEN_EXPIRATION",
        ) as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
        expiresIn: this.configService.get<string>(
          "REFRESH_TOKEN_EXPIRATION",
        ) as StringValue,
      }),
    ]);

    const hashedToken = await this.cryptographyAdapter.hash({
      plainText: refreshToken,
      hashSalt: 8,
    });

    const expireInString = this.configService.get<string>(
      "REFRESH_TOKEN_EXPIRATION",
    );
    const expireInMs = ms(expireInString as StringValue);
    const expiresAt = new Date(Date.now() + expireInMs);

    const newRefreshToken = new RefreshToken({
      token: hashedToken,
      accountId: tokenParams.accountId,
      expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.createRefreshToken(newRefreshToken);

    return { accessToken, refreshToken };
  }
}

interface TokenParams {
  accountId: string;
  userRole: Role;
}
