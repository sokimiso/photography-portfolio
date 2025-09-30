export interface UpdateOrderDto {
  // Order fields
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  basePrice?: number;
  discount?: number;
  finalPrice?: number;
  amountPaid?: number;
  notes?: string;
  shootDate?: string; // ISO string

  // User fields
  userFirstName?: string;
  userLastName?: string;
  userPhoneNumber?: string;
  deliveryAddress?: any; // keep JSON as-is
}
