import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "@/modules/User/domain/user.entity";
import { RefreshTokenPayload } from "@/global/common/strategies/refresh-token-payload.dto";

export const GetUser = createParamDecorator(
  (data: keyof GetUserInterface, ctx: ExecutionContext) => {
    const request: { user: RefreshTokenPayload } = ctx
      .switchToHttp()
      .getRequest();

    if (!request.user) {
      throw new Error(
        "User not found in request. Ensure an authentication guard is in place.",
      );
    }

    const interceptedUser = request.user;

    const user: GetUserInterface = {
      id: interceptedUser.sub,
      userRole: interceptedUser.userRole,
      refreshToken: interceptedUser.refreshToken,
      iat: interceptedUser.iat,
      exp: interceptedUser.exp,
    };

    return data ? user[data] : user;
  },
);

export interface GetUserInterface {
  id: string;
  userRole: Role;
  refreshToken: string;
  iat: number;
  exp: number;
}
