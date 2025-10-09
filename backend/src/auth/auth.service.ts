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

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Update last login timestamp using usersService
    await this.usersService.updateLastLogin(user.id);

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    

    return {
      token,
      role: user.role,
      email: user.email,
      id: user.id,
    };
  }
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token); // Returns the payload
    } catch (err) {
      return null; // or throw new UnauthorizedException()
    }
  }  
}
