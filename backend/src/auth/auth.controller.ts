import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { Response, Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** LOGIN */
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, role, email, id, firstName, lastName } =
      await this.authService.login(loginDto);

    const isProd = process.env.NODE_ENV === 'production';

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? 'none' : 'lax', // allow localhost testing
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    return {
      message: 'Login successful',
      user: { id, role, email, firstName, lastName },
    };
  }

  /** LOGOUT */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logged out' };
  }

  /** GET CURRENT USER */
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.token;

    if (!token) throw new UnauthorizedException('Not authenticated');

    const payload = await this.authService.verifyToken(token);
    if (!payload) throw new UnauthorizedException('Invalid token');

    // Fetch user info from UsersService
    const user = await this.authService['usersService'].findById(payload.sub);

    if (!user || user.deletedAt)
      throw new UnauthorizedException('User not found');

    return {
      user: {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}
