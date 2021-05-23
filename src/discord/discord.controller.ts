import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('discord')
export class DiscordController {
  constructor(private discord: DiscordService) {}

  @Get(['voices'])
  async connectedChannels() {
    return this.discord.voiceConnections();
  }

  @Get(['voice/:channelId'])
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async connectedChannel(@Param('channelId') id, @Res() res) {
    const voice = this.discord
      .voiceConnections()
      .find((c) => c.channel.id === id);

    if (!voice) {
      res.status(404).end();
      return;
    }

    return res.status(200).json(voice);
  }

  @Put('voice/:channelId')
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async joinChannelVoice(@Param('channelId') id) {
    const connection = await this.discord.joinVoice(id);
    return connection.voice.id;
  }

  @Delete('voice/:channelId')
  @ApiParam({
    name: 'channelId',
    description: 'Voice channel id',
    type: 'string',
    required: true,
    example: '839493031580270626',
  })
  async leaveChannelVoice(@Param('channelId') id) {
    await this.discord.leaveVoice(id);
  }
}