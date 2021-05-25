import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { YouTubeService } from './youtube.service';

@ApiTags('media', 'youtube')
@Controller('media/youtube')
export class YouTubeController {
  constructor(private youtube: YouTubeService) {}

  @Get(['fetch-url/audio-only'])
  @ApiQuery({
    name: 'url',
    description: 'video url',
    type: 'string',
    required: true,
    example: 'https://www.youtube.com/watch?v=zs5G5qPudzo',
  })
  @ApiQuery({
    name: 'quality',
    description: 'video url',
    type: 'enum',
    enum: ['lowest', 'highest'],
    required: true,
    example: 'highest',
  })
  async fetchUrlAudioOnly(
    @Query('url') link: string,
    @Query('quality') quality: 'lowest' | 'highest',
  ) {
    const url = await this.youtube.videoMediaUrl(link, { quality });
    return {
      url,
    };
  }
}
