import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from '../common/types/auth-request.type';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();

    const token = request.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const payload = await this.authService.verifyToken(token);

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    return true;
  }
}
