import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  packageId: string;

  @IsString()
  userId: string; // existing user ID

  @IsOptional()
  @IsDateString()
  shootDate?: Date;

  @IsOptional()
  @IsString()
  shootPlace?: string;

  @IsOptional()
  @IsString()
  notes?: string;  

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  finalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  transportPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amountPaid?: number;
}
