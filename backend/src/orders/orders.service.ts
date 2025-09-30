import { Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Generate unique readable order number: XXXXAAAAB
  private async generateReadableOrderNumber(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      const year = new Date().getFullYear();
      const randomFour = Math.floor(Math.random() * 9000) + 100; // 100..9999
      const randomB = Math.floor(Math.random() * 9) + 1; // 1..9
      code = `${year}${randomFour}${randomB}`;

      const existing = await this.prisma.order.findUnique({
        where: { readableOrderNumber: code },
        select: { id: true },
      });
      exists = !!existing;
    } while (exists);

    return code;
  }

  // ---------------- CREATE ORDER ----------------
  async createOrder(dto: CreateOrderDto, user: any) {
    const readableOrderNumber = await this.generateReadableOrderNumber();

    return this.prisma.order.create({
      data: {
        packageId: dto.packageId,
        shootDate: dto.shootDate,
        notes: dto.notes,
        discount: dto.discount ?? 0,
        basePrice: dto.basePrice ?? 0,
        finalPrice: dto.finalPrice ?? 0,
        amountPaid: dto.amountPaid ?? 0,
        status: dto.status ?? 'PENDING',
        readableOrderNumber, // required by schema
        userId: user.id,      // assign existing user
      },
      include: { user: true, package: true },
    });
  }

  // ---------------- UPDATE ORDER ----------------
  async updateOrder(orderId: string, dto: UpdateOrderDto, adminId: string) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, package: true },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        basePrice: dto.basePrice ?? undefined,
        discount: dto.discount ?? undefined,
        finalPrice: dto.finalPrice ?? undefined,
        amountPaid: dto.amountPaid ?? undefined,
        notes: dto.notes ?? undefined,
        shootDate: dto.shootDate ? new Date(dto.shootDate) : undefined,
        status: dto.status ?? undefined,
        package: dto.packageId
          ? { connect: { id: dto.packageId } }
          : undefined,
        user: dto.userId
          ? { connect: { id: dto.userId } } // assign existing user
          : undefined,
      },
      include: { user: true, package: true },
    });
  }


  // Find an order by readable number
  async findByReadableNumber(code: string) {
    return this.prisma.order.findUnique({
      where: { readableOrderNumber: code },
    });
  } 

  // Find an order by status
  async findOrdersByStatus(status: 'PENDING' | 'CONFIRMED'): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { user: true, package: true, }, // include user and package info
    });
  }  

  // Find all packages
  async findAllPackages() {
    return this.prisma.photoshootPackage.findMany({
      where: { deletedAt: null },
    });
  }  

  // Fetch all orders with status != COMPLETED
  async getPendingOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { not: 'COMPLETED' }, // filter out completed orders
      },
      include: {
        user: true,      // include user info
        package: true,   // include package info
      },
      orderBy: {
        createdAt: 'desc', // newest first
      },
    });
  }
}
