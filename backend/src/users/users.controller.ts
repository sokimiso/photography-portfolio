import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Apply guard to all routes by default
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** ------------------------------
   * CREATE USER
   * ----------------------------- */
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return { user };
  }

  /** ------------------------------
   * UPDATE USER
   * ----------------------------- */
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return { user };
  }

  /** ------------------------------
   * GET ALL USERS
   * ----------------------------- */
  @Get()
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return { users };
  }

  /** ------------------------------
   * GET USER BY ID
   * ----------------------------- */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { user };
  }

  /** ------------------------------
   * SEARCH USERS
   * ----------------------------- */
  @Get('search')
  async searchUsers(@Query('query') query: string) {
    const users = await this.usersService.searchUsers(query);
    return { users };
  }

  /** ------------------------------
   * GET USERS BY STATUS
   * ----------------------------- */
  @Get('status/:status')
  async getUsersByStatus(@Param('status') status: 'pending' | 'confirmed' | 'inactive' | 'deleted') {
    return this.usersService.findUsersByStatus(status);
  }
}
