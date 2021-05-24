import { Body, Controller, Get, Injectable, Query } from '@nestjs/common';
import { getInfo, chooseFormat, videoFormat } from 'ytdl-core';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { YouTubeService } from './youtube.service';

@ApiTags('youtube')
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
    const url = await this.youtube.fetchAudioOnlyUrl(link, { quality });
    return {
      url,
    };
  }
}
