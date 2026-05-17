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

@Controller('auth')
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Login successful',
      user: {
        id,
        role,
        email,
        firstName,
        lastName,
      },
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

  /** CURRENT AUTHENTICATED USER */
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.authService.getUserFromToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      user,
    };
  }
}
