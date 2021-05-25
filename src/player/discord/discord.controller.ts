import { Controller, Delete, Get, Param, Put, Res } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

const CHANNEL_ID = {
  name: 'channelId',
  description: 'Voice channel id',
  type: 'string',
  required: true,
  example: '839493031580270626',
};

@ApiTags('discord')
@Controller('discord')
export class DiscordController {
  constructor(private discord: DiscordService) {}

  @Get(['voices'])
  async connectedChannels() {
    const voices = this.discord.voiceConnections();
    return {
      voices,
    };
  }

  @Get(['voice/:channelId'])
  @ApiParam(CHANNEL_ID)
  async connectedChannel(@Param('channelId') id: string, @Res() res: Response) {
    const connections = await this.discord.voiceConnections();
    const voice = connections.find((c) => c.channel.id === id);

    if (!voice) {
      res.status(404).end();
      return;
    }

    return res.status(200).json({ voice });
  }

  @Put('voice/:channelId')
  @ApiParam(CHANNEL_ID)
  async joinChannelVoice(@Param('channelId') id: string) {
    return this.discord.join(id);
  }

  @Delete('voice/:channelId')
  @ApiParam(CHANNEL_ID)
  async leaveChannelVoice(@Param('channelId') id: string) {
    return this.discord.leave(id);
  }
}
