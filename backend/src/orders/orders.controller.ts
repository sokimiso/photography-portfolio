import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PackageResponseDto } from '../packages/dto/package-response.dto';
import { AuthRequest } from '../common/types/auth-request.type'; 

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async getPendingOrders(@Req() req: Request) {
    return this.ordersService.findOrdersByStatus('PENDING');
  }

  @Get('confirmed')
  @UseGuards(JwtAuthGuard)
  async getConfirmedOrders(@Req() req: Request) {
    return this.ordersService.findOrdersByStatus('CONFIRMED');
  }
  
  @Get('cancelled')
  @UseGuards(JwtAuthGuard)
  async getCancelledOrders(@Req() req: Request) {
    return this.ordersService.findOrdersByStatus('CANCELLED');
  }

  @Get('completed')
  @UseGuards(JwtAuthGuard)
  async getCompletedOrders(@Req() req: Request) {
    return this.ordersService.findOrdersByStatus('COMPLETED');
  }  

  @UseGuards(JwtAuthGuard)
  @Get('pending-payments')
  async getPendingPayments() {
    return this.ordersService.findPendingPayments();
  }
    
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthRequest,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not found in request');
    }
    return this.ordersService.createOrder(createOrderDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: AuthRequest,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not found in request');
    }
    return this.ordersService.updateOrder(id, updateOrderDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteOrder(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not found in request');
    }
    return this.ordersService.softDeleteOrder(id, req.user.id);
  }

  @Get()
  async getOrders(@Query('status') status: string) {
    if (status !== 'PENDING' && status !== 'CONFIRMED') {
      throw new BadRequestException('Invalid status');
    }
    return this.ordersService.findOrdersByStatus(status as 'PENDING' | 'CONFIRMED');
  }

  @Get('user/:userId')
  async getOrdersByUser(
    @Param('userId') userId: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findOrdersByUser(userId, status);
  }  

  @Get('packages')
  async getPackages(): Promise<PackageResponseDto[]> {
    const packages = await this.ordersService.findAllPackages();
    return packages.map(pkg => ({
      id: pkg.id,
      displayName: pkg.displayName,
      description: pkg.description ?? undefined,
      basePrice: Number(pkg.basePrice),
      durationHrs: pkg.durationHrs,
      maxPhotos: pkg.maxPhotos ?? undefined,
      isActive: pkg.isActive,
    }));
  }
}
