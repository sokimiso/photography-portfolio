import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TextsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.siteText.findMany();
  }
}
