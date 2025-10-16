import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PhotosModule } from './photos/photos.module';
import { PackagesModule } from './packages/packages.module';
import { SearchModule } from './search/search.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
    }),
    AuthModule,
    UsersModule,
    PhotosModule,
    PackagesModule,
    SearchModule,
    OrdersModule,
    NotificationsModule,
    ReservationsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
