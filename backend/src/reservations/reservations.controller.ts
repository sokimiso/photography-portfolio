import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async createReservation(@Body() dto: CreateReservationDto) {
    try {
      const result = await this.reservationsService.createReservation(dto);
      return result;
    } catch (err: any) {
      throw new BadRequestException(
        err.message || 'Failed to create reservation',
      );
    }
  }
}
