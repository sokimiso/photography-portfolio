import { Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- CREATE ORDER ----------------
  async createOrder(dto: CreateOrderDto, userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    while (true) {
      const randomFour = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
      const readableOrderNumber = `${year}${month}${day}${randomFour}`;

      try {
        return await this.prisma.order.create({
          data: {
            packageId: dto.packageId,
            shootDate: dto.shootDate ? new Date(dto.shootDate) : undefined,
            shootPlace: dto.shootPlace,
            notes: dto.notes,
            discount: dto.discount ?? 0,
            basePrice: dto.basePrice ?? 0,
            finalPrice: dto.finalPrice ?? 0,
            transportPrice: dto.transportPrice ?? 0,
            amountPaid: dto.amountPaid ?? 0,
            status: dto.status ?? "PENDING",
            readableOrderNumber,
            userId: dto.userId, // assign user by id
          },
          include: { user: true, package: true },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          // Unique constraint violation → retry
          continue;
        }
        throw error; // Other DB error
      }
    }
  }

  // ---------------- UPDATE ORDER (with photo handling) ----------------
  async updateOrder(orderId: string, dto: UpdateOrderDto & { photos?: any[] }, adminId: string) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, package: true, orderPhotos: true },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // --- Update main order fields ---
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        basePrice: dto.basePrice ?? undefined,
        discount: dto.discount ?? undefined,
        finalPrice: dto.finalPrice ?? undefined,
        transportPrice: dto.transportPrice ?? undefined,
        amountPaid: dto.amountPaid ?? undefined,
        notes: dto.notes ?? undefined,
        shootPlace: dto.shootPlace ?? undefined,
        shootDate: dto.shootDate ? new Date(dto.shootDate) : undefined,
        status: dto.status ?? undefined,
        package: dto.packageId
          ? { connect: { id: dto.packageId } }
          : undefined,
        user: dto.userId
          ? { connect: { id: dto.userId } }
          : undefined,
      },
      include: { user: true, package: true },
    });

    // --- Handle attached photos ---
    if (dto.photos && Array.isArray(dto.photos)) {
      for (const photo of dto.photos) {
        if (!photo.id) continue; // skip invalid entries

        await this.prisma.orderPhoto.update({
          where: { id: photo.id },
          data: {
            isFinalDelivery: photo.isFinalDelivery ?? undefined,
            toPostprocess: photo.toPostprocess ?? undefined,
            toPrint: photo.toPrint ?? undefined,
          },
        });
      }
    }

    // --- Handle status change logging ---
    if (dto.status && dto.status !== existingOrder.status) {
      await this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status,
          changedBy: adminId,
        },
      });
    }

    return updatedOrder;
  }


  // ---------------- SOFT DELETE ORDER ----------------
  async softDeleteOrder(orderId: string, adminId: string) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      });

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        deletedAt: new Date(), // mark as deleted
      },
    });
  }  


  // Find an order by readable number
  async findByReadableNumber(code: string) {
    return this.prisma.order.findUnique({
      where: { readableOrderNumber: code, deletedAt: null, },
    });
  } 

  // Find an order by status
  async findOrdersByStatus(
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
    limit?: number,
    orderDirection: 'asc' | 'desc' = 'asc'
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { status, deletedAt: null },
      orderBy: { shootDate: orderDirection },
      take: limit, // optional
      include: { user: true, package: true },
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
        deletedAt: null,
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

  // Find orders with COMPLETED status but not fully paid
  async findPendingPayments(): Promise<Order[]> {
    const completedOrders = await this.prisma.order.findMany({
      where: { deletedAt: null, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      include: { user: true, package: true }, // include related info
    });

    // Filter orders where amountPaid < finalPrice
    return completedOrders.filter(
      o => (o.amountPaid ?? 0) < (o.finalPrice ?? 0)
    );
  }
}
