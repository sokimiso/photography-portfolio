// Must match backend DTOs exactly!

export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export interface CreateOrderDto {
  status?: OrderStatus;
  basePrice?: number;
  discount?: number;
  finalPrice?: number;
  amountPaid?: number;
  notes?: string;
  shootDate?: string; // ISO string
  packageId: string;
  userEmail: string; // existing user
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  basePrice?: number;
  discount?: number;
  finalPrice?: number;
  amountPaid?: number;
  notes?: string;
  shootDate?: string; // ISO string
  packageId?: string;
  userEmail?: string; // reassign to different user
}
