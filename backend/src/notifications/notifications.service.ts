import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification, NotificationStatus, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch pending notifications for a specific user
  async getPendingNotifications(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId, status: NotificationStatus.PENDING },
      orderBy: { sentAt: 'desc' },
      include: { order: true },
    });
  }

  // Create a new notification
  async createNotification(data: {
    userId: string;
    orderId?: string;
    type: NotificationType;
    message: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  // Mark a notification as SENT
  async markAsSent(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.SENT, sentAt: new Date() },
    });
  }
}
