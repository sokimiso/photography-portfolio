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

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** ------------------------------
   * CREATE USER
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return { user };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // rethrow to see 500 in Postman
    }
  }

  /** ------------------------------
   * UPDATE USER
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return { user };
  }

  /** ------------------------------
   * SEARCH USERS
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(@Query('query') query: string) {
    console.log('Query received in controller:', query);
    return this.usersService.searchUsers(query); // returns array
  }

  /** ------------------------------
   * GET USER BY ID
   * ----------------------------- */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { user };
  }
}
