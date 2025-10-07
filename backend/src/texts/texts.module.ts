import { Module } from '@nestjs/common';
import { TextsService } from './texts.service';
import { TextsController } from './texts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TextsService, PrismaService],
  controllers: [TextsController],
})
export class TextsModule {}
