import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenPayload } from '@/global/common/strategies/refresh-token-payload.dto';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: { user?: RefreshTokenPayload } = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.userRole === 'ADMIN') {
      return true;
    }

    throw new ForbiddenException();
  }
}
