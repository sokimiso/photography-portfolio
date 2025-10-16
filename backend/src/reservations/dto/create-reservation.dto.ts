import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @IsString()
  packageId: string;

  @IsString()
  message: string; // Customer reservation message
}
