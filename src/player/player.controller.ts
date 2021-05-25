import { Controller, Param, Post, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';

@ApiTags('player')
@Controller('player')
export class PlayerController {
  constructor(private player: PlayerService) {}

  @Post([':channelId/play-now'])
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
    required: false,
    example: 'https://www.youtube.com/watch?v=zs5G5qPudzo',
  })
  async playNow(@Param('channelId') id: string, @Query('url') link: string) {
    return { playNow: await this.player.playNow(id, link) };
  }

  @Post([':channelId/play-pause'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async playPause(@Param('channelId') id: string) {
    return { playNow: await this.player.playPause(id) };
  }
}
