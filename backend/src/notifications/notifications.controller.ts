import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

@Controller('api/ notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications/pending/:userId
  @Get('pending/:userId')
  async getPendingNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getPendingNotifications(userId);
  }

  // POST /notifications
  @Post()
  async createNotification(
    @Body() body: { userId: string; orderId?: string; type: NotificationType; message: string },
  ) {
    return this.notificationsService.createNotification(body);
  }

  // POST /notifications/:id/sent
  @Post(':id/sent')
  async markNotificationAsSent(@Param('id') id: string) {
    return this.notificationsService.markAsSent(id);
  }
}
