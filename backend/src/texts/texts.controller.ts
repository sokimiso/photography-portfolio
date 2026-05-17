import { Controller, Get } from '@nestjs/common';
import { TextsService } from './texts.service';

@Controller('texts')
export class TextsController {
  constructor(private textsService: TextsService) {}

  @Get()
  getAll() {
    return this.textsService.findAll();
  }
}
