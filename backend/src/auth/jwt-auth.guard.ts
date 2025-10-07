import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from '../common/types/auth-request.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.cookies?.token;

    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const payload = await this.authService.verifyToken(token);
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException(e.message || 'Invalid or expired token');
    }
  }
}
