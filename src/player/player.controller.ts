import {
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';

@ApiTags('player')
@Controller('player')
export class PlayerController {
  constructor(private player: PlayerService) {}

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
    return { play: await this.player.play(id, link) };
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
    return { stop: await this.player.stop(id) };
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
    return { pause: await this.player.pause(id) };
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
    return { resume: await this.player.pause(id) };
  }
}
