import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService, // dependency for sending emails
  ) {}

  // ----------------------------------------
  // CREATE USER
  // ----------------------------------------
  async createUser(createUserDto: CreateUserDto) {
    try {
      const phone = createUserDto.phoneNumber || '';
      const tempPassword = phone.slice(-6).padStart(6, '0');
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Create the user in the DB
      const newUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          phoneNumber: createUserDto.phoneNumber ?? '',
          deliveryAddress: createUserDto.deliveryAddress || undefined,
          role: createUserDto.role || UserRole.CUSTOMER,
          passwordHash,
          emailConfirmed: false,
        },
      });

      // Check if confirmation email should be sent
      if (!createUserDto.sendConfirmationEmail) {
        return newUser;
      }

      // Validate EMAIL_CONFIRM_SECRET
      if (!process.env.EMAIL_CONFIRM_SECRET) {
        throw new Error('EMAIL_CONFIRM_SECRET is not set');
      }

      // Generate confirmation token
      const emailToken = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.EMAIL_CONFIRM_SECRET as string,
        { expiresIn: '7d' },
      );

      // Update user with token
      await this.prisma.user.update({
        where: { id: newUser.id },
        data: {
          emailConfirmationToken: emailToken,
          emailConfirmationTokenExpiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ),
        },
      });

      // Send confirmation email
      await this.mailService.sendEmailConfirmation(newUser.email, emailToken);
      return newUser;
    } catch (err: any) {
      throw err;
    }
  }

  // ----------------------------------------
  // CONFIRM EMAIL
  // ----------------------------------------
  async confirmEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailConfirmationToken: token,
        emailConfirmationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) throw new Error('Invalid or expired confirmation token.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
        emailConfirmationTokenExpiresAt: null,
      },
    });

    return { message: 'Email successfully confirmed', userId: user.id };
  }

  // ----------------------------------------
  // SEND RESET PASSWORD EMAIL
  // ----------------------------------------
  async sendPasswordResetEmail(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new Error('User not found');

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.PASSWORD_RESET_SECRET as string,
      { expiresIn: '1h' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });

    await this.mailService.sendPasswordReset(user.email, resetToken);
  }

  // ----------------------------------------
  // UPDATE USER
  // ----------------------------------------
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        role: rest.role as UserRole | undefined,
        passwordHash,
      },
    });
  }

  // ----------------------------------------
  // UPDATE LAST LOGIN
  // ----------------------------------------
  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  // ----------------------------------------
  // FIND USER BY ID (for AuthController/me)
  // ----------------------------------------
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        deliveryAddress: true,
        role: true,
        emailConfirmed: true,
        lastLoginAt: true,
        deletedAt: true,
      },
    });
  }

  // ----------------------------------------
  // FIND USER BY EMAIL (for AuthService/login)
  // ----------------------------------------
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        passwordHash: true,
        deletedAt: true,
        emailConfirmed: true,
      },
    });
  }

  // ----------------------------------------
  // CHECK IF USER EXISTS BY EMAIL
  // ----------------------------------------
  async checkIfUserExists(email: string) {
    if (!email) throw new Error('Email is required');

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    return { exists: !!user };
  }

  // ----------------------------------------
  // FIND ALL USERS
  // ----------------------------------------
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: { not: 'ADMIN' },
      },
      select: {
        id: true,
        email: true,
        emailConfirmed: true,
        firstName: true,
        lastName: true,
        lastLoginAt: true,
        phoneNumber: true,
        deliveryAddress: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    return { users };
  }

  // ----------------------------------------
  // FIND USERS BY STATUS
  // ----------------------------------------
  async findUsersByStatus(
    status: 'pending' | 'confirmed' | 'inactive' | 'deleted',
  ) {
    const where: any = {};

    switch (status) {
      case 'pending':
        where.emailConfirmed = false;
        where.deletedAt = null;
        break;
      case 'confirmed':
        where.emailConfirmed = true;
        where.deletedAt = null;
        break;
      case 'inactive':
        where.deletedAt = null;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        where.updatedAt = { lt: oneYearAgo };
        break;
      case 'deleted':
        where.deletedAt = { not: null };
        break;
    }

    return this.prisma.user.findMany({
      where: { ...where, role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        emailConfirmed: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        deliveryAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------
  // SEARCH USERS BY QUERY
  // ----------------------------------------
  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        deliveryAddress: true,
        role: true,
        emailConfirmed: true,
        orders: true,
        createdAt: true,
      },
    });
  }
}
