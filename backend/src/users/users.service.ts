import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { UserRole } from '@prisma/client';
import { MailService } from '../mail/mail.service';


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService, // dependency injection for email sending
  ) {}

/** ------------------------------
 * CREATE USER
 * ----------------------------- */
async createUser(createUserDto: CreateUserDto) {
  const phone = createUserDto.phoneNumber || '';
  const tempPassword = phone.slice(-6).padStart(6, '0');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

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

  if (createUserDto.sendConfirmationEmail) {
    try {
      // Generate JWT for email confirmation
      const emailToken = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.EMAIL_CONFIRM_SECRET as string,
        { expiresIn: '7d' },
      );

      // Update user with confirmation token
      await this.prisma.user.update({
        where: { id: newUser.id },
        data: {
          emailConfirmationToken: emailToken,
          emailConfirmationTokenExpiresAt: new Date(Date.now() + 168 * 60 * 60 * 1000), // valid for 7 days
        },
      });

      // Send email
      await this.mailService.sendEmailConfirmation(newUser.email, emailToken);

      console.log(`Confirmation email sent to ${newUser.email}`);
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
  }

  return newUser;
}

  /** ------------------------------
   * CONFIRM EMAIL
   * ----------------------------- */
  async confirmEmail(token: string) {
    // Find user by token and check expiry
    console.log("zbehla funkcia confirmEmail");
    const user = await this.prisma.user.findFirst({
      where: {
        emailConfirmationToken: token,
        emailConfirmationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired confirmation token.');
    }

    // Mark email as confirmed and remove token
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

  /** ------------------------------
   * SEND RESET PASSWORD EMAIL
   * ----------------------------- */
  async sendPasswordResetEmail(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new Error('User not found');

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.PASSWORD_RESET_SECRET as string,
      { expiresIn: '1h' } // short-lived token
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetTokenExpiresAt: new Date(Date.now() + 3600 * 1000) },
    });

    await this.mailService.sendPasswordReset(user.email, resetToken);
  }



  /** ------------------------------
   * UPDATE USER
   * ----------------------------- */
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

  /** ------------------------------
   * UPDATE LAST LOGIN ON USER
   * ----------------------------- */
  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }  

  /** ------------------------------
   * FIND BY ID
   * ----------------------------- */
  async findById(id: string) {
    console.log('Searching by id:', id);
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
        orders: true,
      },
    });
  }

  /** ------------------------------
   * FIND BY EMAIL
   * ----------------------------- */
  async findByEmail(email: string) {
    console.log('Searching by email:', email);
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /** ------------------------------
   * FIND ALL USERS
   * ----------------------------- */
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: {
          not: 'ADMIN',  // filter out admin users
        },
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

  /** ------------------------------
   * FIND USERS BY STATUS
   * ----------------------------- */
  async findUsersByStatus(status: "pending" | "confirmed" | "inactive" | "deleted") {
    const where: any = {};

    switch (status) {
      case "pending":
        where.emailConfirmed = false;
        where.deletedAt = null;
        break;
      case "confirmed":
        where.emailConfirmed = true;
        where.deletedAt = null;
        break;
      case "inactive":
        where.deletedAt = null;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        where.updatedAt = { lt: oneYearAgo }; // last updated more than 1 year ago
        break;
      case "deleted":
        where.deletedAt = { not: null };
        break;
    }

    return this.prisma.user.findMany({
      where: {
        ...where,
        role: "CUSTOMER",
      },
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
      orderBy: { createdAt: "desc" },
    });
  }  
  /** ------------------------------
   * SEARCH USERS BY QUERY
   * ----------------------------- */
  async searchUsers(query: string) {
    console.log('Searching users for users:', query);
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' }, // newest first
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
