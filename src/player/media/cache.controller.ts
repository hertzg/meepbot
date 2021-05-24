import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CacheService } from './cache.service';

@ApiTags('cache')
@Controller('media/cache')
export class CacheController {
  constructor(private cache: CacheService) {}

  @Get()
  async index() {
    return {
      cache: this.cache.cache(),
    };
  }
}
