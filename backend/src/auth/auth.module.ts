import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    // UsersModule is needed for AuthService
    forwardRef(() => UsersModule),

    // JWT configuration
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d', // default 1 day
      },
    }),
  ],
  controllers: [AuthController], // Auth routes
  providers: [
    AuthService, // Main authentication logic
    PrismaService, // Prisma ORM for database access
    JwtStrategy, // JWT verification strategy for guards
    JwtAuthGuard, // Global or route-specific guard
  ],
  exports: [
    AuthService, // Export to allow injection into other modules
    JwtModule, // Export so other modules can sign/verify tokens
    JwtAuthGuard, // Export for protecting routes elsewhere
  ],
})
export class AuthModule {}
