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
    // Skip JWT check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token =
      request.cookies?.token ||
      request.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      // Verify token with your existing AuthService
      const payload = await this.authService.verifyToken(token);

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException(
        err.message || 'Invalid or expired token',
      );
    }
  }
}
