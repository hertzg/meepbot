import { Controller, Delete, Param, Post, Put, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlaybackService } from './playback.service';

@ApiTags('playback')
@Controller('player/playback')
export class PlaybackController {
  constructor(private playback: PlaybackService) {}

  @Put([':channelId'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  @ApiQuery({
    name: 'url',
    description: 'video url',
    type: 'string',
    required: true,
    example: 'https://www.youtube.com/watch?v=zs5G5qPudzo',
  })
  async play(@Param('channelId') id, @Query('url') link) {
    return { play: await this.playback.play(id, link) };
  }

  @Delete([':channelId'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async stop(@Param('channelId') id) {
    return { stop: await this.playback.stop(id) };
  }

  @Post([':channelId/pause'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async pause(@Param('channelId') id) {
    return { pause: await this.playback.pause(id) };
  }

  @Post([':channelId/resume'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async resume(@Param('channelId') id) {
    return { resume: await this.playback.resume(id) };
  }
}
