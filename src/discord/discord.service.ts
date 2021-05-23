import { Injectable } from '@nestjs/common';
import { Client, Channel, VoiceChannel, VoiceConnection } from 'discord.js';

const isVoiceChannel = (channel: Channel): channel is VoiceChannel =>
  channel.type === 'voice';

@Injectable()
export class DiscordService {
  constructor(private client: Client) {}

  voiceConnections = () => {
    return this.client.voice.connections.map((c) => {
      return {
        id: c.voice.id,
        channel: {
          id: c.channel.id,
        },
      };
    });
  };

  joinVoice = async (channelId: string): Promise<VoiceConnection> => {
    const channel = await this.client.channels.fetch(channelId);

    if (!isVoiceChannel(channel)) {
      throw new Error('Can not join non-voice channels');
    }

    if (!channel.joinable) {
      throw new Error('Voice channel is not joinable');
    }

    return channel.join();
  };

  leaveVoice = async (channelId: string): Promise<void> => {
    return this.client.voice.connections
      .find((c) => c.channel.id === channelId)
      ?.channel.leave();
  };
}
