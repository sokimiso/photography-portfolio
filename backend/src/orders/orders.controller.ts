import {
  Controller,
  Get,
  Post,
  Put,
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

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: AuthRequest) {
    if (!req.user) {
      throw new BadRequestException('User not found in request');
    }
    return this.ordersService.createOrder(createOrderDto, req.user);
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
    console.log('DTO received in controller:', updateOrderDto);
    return this.ordersService.updateOrder(id, updateOrderDto, req.user.id);
  }

  @Get()
  async getOrders(@Query('status') status: string) {
    if (status !== 'PENDING' && status !== 'CONFIRMED') {
      throw new BadRequestException('Invalid status');
    }
    return this.ordersService.findOrdersByStatus(status as 'PENDING' | 'CONFIRMED');
  }

  @Get('packages')
  async getPackages() {
    return this.ordersService.findAllPackages();
  }
}
