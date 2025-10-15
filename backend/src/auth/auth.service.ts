import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Validate user credentials */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.deletedAt || !user.emailConfirmed) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /** Login and generate JWT */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return {
      token,
      role: user.role,
      email: user.email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  /** Verify token */
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      return null;
    }
  }
}
