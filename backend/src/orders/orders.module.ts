import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

@Module({
  imports: [AuthModule],
  providers: [OrdersService, PrismaService, PhotosService],
  controllers: [OrdersController, PhotosController],
  exports: [OrdersService],
})
export class OrdersModule {}
