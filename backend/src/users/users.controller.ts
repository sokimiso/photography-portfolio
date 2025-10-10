import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Missing token');

    try {
      await this.usersService.confirmEmail(token);
      console.log("called this.usersService.confirmEmail(token) with token = ",token)
      return { message: 'E-mail successfully confirmed!' };
    } catch (err: any) {
      throw new BadRequestException(
        err?.message || 'Email confirmation failed. Token may be invalid or expired.'
      );
    }
  }

  @Public()
  @Get('exists')
  async checkIfUserExists(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }

    const result = await this.usersService.checkIfUserExists(email);
    return result; // { exists: true/false }
  }  

  /** ------------------------------
   * CREATE USER
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return { user };
  }

  /** ------------------------------
   * UPDATE USER
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return { user };
  }

  /** ------------------------------
   * GET ALL USERS
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return { users };
  }

  /** ------------------------------
   * SEARCH USERS
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Query('query') query: string) {
    const users = await this.usersService.searchUsers(query);
    return { users };
  }

  /** ------------------------------
   * GET USER BY ID
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { user };
  }  

  /** ------------------------------
   * GET USERS BY STATUS
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get('status/:status')
  async getUsersByStatus(@Param('status') status: 'pending' | 'confirmed' | 'inactive' | 'deleted') {
    return this.usersService.findUsersByStatus(status);
  }

}
