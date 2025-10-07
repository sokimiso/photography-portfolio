import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryAddress: any; // JSON kept as-is
  role: 'CUSTOMER' | 'ADMIN';
  emailConfirmed: boolean;
  orders?: OrderResult[];
}

export interface PackageResult {
  id: string;
  displayName: string;
  basePrice: number;
  internalName: string;
}

export interface OrderResult {
  id: string;
  readableOrderNumber: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  transportPrice: number;
  amountPaid: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  shootDate?: string;
  shootPlace?: string;
  createdAt?: string;
  deletedAt?: string | null;
  notes?: string;
  user: UserResult;
  package: PackageResult;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string): Promise<{ users: UserResult[]; orders: OrderResult[] }> {
    // USERS with their PENDING or CONFIRMED orders
    const rawUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        deliveryAddress: true,
        role: true,
        emailConfirmed: true,
        orders: {
          where: { status: { in: ['PENDING', 'CONFIRMED'] } },
          select: {
            id: true,
            readableOrderNumber: true,
            basePrice: true,
            discount: true,
            finalPrice: true,
            transportPrice: true,
            amountPaid: true,
            status: true,
            shootDate: true,
            shootPlace: true,
            createdAt: true,
            deletedAt: true,
            notes: true,
            package: { select: { id: true, displayName: true, basePrice: true, internalName: true } },
          },
          orderBy: { shootDate: 'desc' }, // latest first
        },
      },
    });

const users: UserResult[] = rawUsers.map((u) => ({
  ...u,
  deliveryAddress: u.deliveryAddress ?? null,
  orders: u.orders?.map((o) => ({
    ...o,
    basePrice: Number(o.basePrice),
    discount: Number(o.discount),
    finalPrice: Number(o.finalPrice),
    transportPrice: Number(o.transportPrice),
    amountPaid: Number(o.amountPaid || 0),
    shootDate: o.shootDate?.toISOString(),
    createdAt: o.createdAt?.toISOString(),
    deletedAt: o.deletedAt?.toISOString(),
    notes: o.notes || "",
    shootPlace: o.shootPlace || "",
    user: {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phoneNumber: u.phoneNumber,
      deliveryAddress: u.deliveryAddress ?? null,
      role: u.role,
      emailConfirmed: u.emailConfirmed,
    }, // <-- attach parent user
    package: { ...o.package, basePrice: Number(o.package.basePrice) },
  })),
}));


    // ORDERS independent of users (for flat search by order number)
    const rawOrders = await this.prisma.order.findMany({
      where: { readableOrderNumber: { contains: query, mode: 'insensitive' } },
      select: {
        id: true,
        readableOrderNumber: true,
        basePrice: true,
        discount: true,
        finalPrice: true,
        transportPrice: true,
        amountPaid: true,
        status: true,
        shootDate: true,
        shootPlace: true,
        createdAt: true,
        deletedAt: true,
        notes: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            deliveryAddress: true,
            role: true,
            emailConfirmed: true,
          },
        },
        package: { select: { id: true, displayName: true, basePrice: true, internalName: true } },
      },
    });

    const orders: OrderResult[] = rawOrders.map((o) => ({
      id: o.id,
      readableOrderNumber: o.readableOrderNumber,
      basePrice: Number(o.basePrice),
      discount: Number(o.discount),
      finalPrice: Number(o.finalPrice),
      transportPrice: Number(o.transportPrice),
      amountPaid: Number(o.amountPaid || 0),
      status: o.status,
      shootDate: o.shootDate?.toISOString(),
      createdAt: o.createdAt?.toISOString(),
      deletedAt: o.deletedAt?.toISOString(),
      notes: o.notes || "",
      shootPlace: o.shootPlace || "",
      user: {
        ...o.user,
        deliveryAddress: o.user.deliveryAddress ?? null,
      },
      package: { ...o.package, basePrice: Number(o.package.basePrice) },
    }));

    return { users, orders };
  }
}
