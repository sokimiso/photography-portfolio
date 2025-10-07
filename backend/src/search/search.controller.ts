import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async search(@Query('query') query: string) {
    if (!query || query.trim() === '') {
      return { users: [], orders: [] };
    }
    return this.searchService.globalSearch(query);
  }
}
