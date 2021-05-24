import { Injectable, Logger } from '@nestjs/common';
import { Client, Channel, VoiceChannel, VoiceConnection } from 'discord.js';
import { Readable } from 'stream';

const isVoiceChannel = (channel: Channel): channel is VoiceChannel =>
  channel.type === 'voice';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private client: Client) {}

  voiceConnections = () => {
    return this.client.voice.connections.map((c) => {
      return {
        id: c.voice.id,
        dispatcher: {
          paused: c.dispatcher.paused,
          pausedSince: c.dispatcher.pausedSince,
          pausedTime: c.dispatcher.pausedTime,
          streamTime: c.dispatcher.streamTime,
          totalStreamTime: c.dispatcher.totalStreamTime,
        },
        channel: {
          id: c.channel.id,
        },
      };
    });
  };

  getConnectionByChannel = (channelId: string) => {
    return this.client.voice.connections.find(
      (c) => c.channel.id === channelId,
    );
  };

  play = (channelId: string, stream: Readable) => {
    const conn = this.getConnectionByChannel(channelId);
    if (conn) {
      this.logger.log('Starting playback');
      const dispatcher = conn.play(stream, { type: 'webm/opus' });
      dispatcher.once('finish', () => {
        this.leave(channelId);
      });
      return true;
    }
    return false;
  };

  pause = (channelId: string) => {
    const conn = this.getConnectionByChannel(channelId);
    if (conn) {
      conn.dispatcher.pause();
      return true;
    }
    return false;
  };

  resume = (channelId: string) => {
    const conn = this.getConnectionByChannel(channelId);
    if (conn) {
      conn.dispatcher.resume();
      return true;
    }
    return false;
  };

  join = async (channelId: string): Promise<VoiceConnection> => {
    const conn = this.getConnectionByChannel(channelId);
    if (conn) {
      return conn;
    }

    const channel = await this.client.channels.fetch(channelId);
    if (!isVoiceChannel(channel)) {
      throw new Error('Can not join non-voice channels');
    }

    return channel.join();
  };

  leave = async (channelId: string): Promise<boolean> => {
    const conn = this.getConnectionByChannel(channelId);
    if (conn) {
      await conn.channel.leave();
      return true;
    }
    return false;
  };
}
