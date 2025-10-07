import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  // Order fields
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Base price must be a number' })
  basePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Discount must be a number' })
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'FinalPrice must be a number' })
  finalPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'TransportPrice must be a number' })
  transportPrice?: number;  

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'AmountPaid must be a number' })
  amountPaid?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  shootPlace?: string;  

  @IsOptional()
  @IsDateString()
  shootDate?: string;

  @IsOptional()
  @IsString()
  packageId?: string; // optional update to package

  @IsOptional()
  @IsString()
  userId?: string; // optional reassignment to existing user
}
