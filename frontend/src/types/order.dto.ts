// Must match backend DTOs exactly!

export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface CreateOrderDto {
  status?: OrderStatus;
  basePrice?: number;
  discount?: number;
  finalPrice?: number;
  transportPrice?: number;
  amountPaid?: number;
  notes?: string;
  shootPlace?: string;
  shootDate?: string; // ISO string
  packageId: string;
  userId: string; // existing user
  
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  basePrice?: number;
  discount?: number;
  finalPrice?: number;
  transportPrice?: number;
  amountPaid?: number;
  notes?: string;
  shootPlace?: string;
  shootDate?: string; // ISO string
  packageId?: string;
  userEmail?: string; // reassign to different user
}

export interface UserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryAddress: any;
  role: "CUSTOMER" | "ADMIN";
  emailConfirmed: boolean;
  orders?: OrderResult[];
  createdAt?: string;
  deletedAt?: string | null;
  lastLoginAt?: string | null;
  updatedAt?: string | null;
  passwordHash?: string;
}

export interface PhotoshootPackage {
  id: string;
  internalName?: string;
  displayName: string;
  description?: string;
  basePrice: number;
  durationHrs?: number;
  maxPhotos?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface OrderResult {
  id: string;
  readableOrderNumber: string;
  status: OrderStatus;
  basePrice: number;
  finalPrice: number;
  transportPrice: number;
  amountPaid?: number;
  shootDate?: string;
  shootPlace?: string;
  createdAt?: string;
  deletedAt?: string | null;
  notes?: string;
  discount?: number;
  user: UserResult;
  package: PhotoshootPackage;
}

export interface OrderPhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  orderId?: string;
  uploadedBy?: string;
  isPublic?: boolean;
  isVisible?: boolean;
  isFinalDelivery?: boolean;
  toPostprocess?: boolean;
  toPrint?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
