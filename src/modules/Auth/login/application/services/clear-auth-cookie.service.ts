import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { Env } from "@/global/env.schema";

@Injectable()
export class ClearAuthCookiesService {
  constructor(private readonly ConfigService: ConfigService<Env, true>) {}

  public execute(res: Response): void {
    const isDeployed =
      this.ConfigService.get<string>("NODE_ENV") === "production" ||
      this.ConfigService.get<string>("NODE_ENV") === "stage";

    res.clearCookie("refreshToken", {
      httpOnly: isDeployed,
      secure: isDeployed,
      sameSite: "lax",
      path: "/",
    });
  }
}
