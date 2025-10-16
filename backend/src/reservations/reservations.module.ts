import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    PrismaService,
    UsersService,
    OrdersService,
    NotificationsService,
    MailService,
  ],
})
export class ReservationsModule {}
