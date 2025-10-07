import { Controller, Get, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/packages') // matches frontend call
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.packagesService.findAll();
  }
}
