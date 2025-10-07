import { Controller, Get, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('api/packages') // matches frontend call
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}


  @Get()
  async findAll() {
    return this.packagesService.findAll();
  }
}
