import { Body, Controller, Post, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { Response, Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, role, email, id } = await this.authService.login(loginDto);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return { role, email, id }; // send user info to frontend
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logged out' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies['token'];
    if (!token) throw new UnauthorizedException();

    const payload = await this.authService.verifyToken(token);
    if (!payload) throw new UnauthorizedException();

    return {
      user: {
        id: payload.sub,
        role: payload.role,
      },
    };
  }
}
