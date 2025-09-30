import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { OrdersService } from '../orders/orders.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, UsersModule, OrdersModule, PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, OrdersService],
  exports: [OrdersService],
})
export class SearchModule {}
