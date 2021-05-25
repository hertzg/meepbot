import { Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { AudioService } from './audio.service';

@ApiTags('playback')
@Controller('player/playback')
export class AudioController {
  constructor(private playback: AudioService) {}

  @Delete([':channelId'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async stop(@Param('channelId') id: string) {
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
  async pause(@Param('channelId') id: string) {
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
  async resume(@Param('channelId') id: string) {
    return { resume: await this.playback.resume(id) };
  }
}
