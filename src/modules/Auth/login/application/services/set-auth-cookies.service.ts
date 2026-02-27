import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import * as ms from "ms";
import { StringValue } from "ms";
import { Env } from "@/global/env.schema";
import { UserRepository } from "@/modules/User/domain/user.repository";

@Injectable()
export class SetAuthCookiesService {
  constructor(
    private readonly ConfigService: ConfigService<Env, true>,
    private readonly UserRepository: UserRepository,
  ) {}

  public execute(res: Response, refreshToken: string): void {
    const expireInString = this.ConfigService.get<string>(
      "REFRESH_TOKEN_EXPIRATION",
    );
    const expireInMs = ms(expireInString as StringValue);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: expireInMs,
      path: "/",
    });
  }
}
