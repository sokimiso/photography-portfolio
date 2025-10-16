import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UserRole, NotificationType } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createReservation(dto: CreateReservationDto) {
    // 1️⃣ Find or create user
    let user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      user = await this.usersService.createUser({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        role: UserRole.CUSTOMER,
        password: dto.phoneNumber?.slice(-6).padStart(6, '0') || '123456',
        sendConfirmationEmail: true,
      });
    }

    // 2️⃣ Create order
    const order = await this.ordersService.createOrder(
      {
        userId: user.id, // required
        status: 'PENDING',
        customerMessage: dto.message ?? undefined,
        packageId: dto.packageId,
      },
      user.id,
    );

    // 3️⃣ Create notification
    const notificationMessage = `New reservation from ${user.firstName} ${user.lastName} (${user.email})
Message: ${dto.message ?? '-'}
Order ID: ${order.readableOrderNumber}`;

    await this.notificationsService.createNotification({
      userId: user.id,
      orderId: order.id,
      type: NotificationType.ORDER_STATUS,
      message: notificationMessage,
    });

    return { user, order };
  }
}
