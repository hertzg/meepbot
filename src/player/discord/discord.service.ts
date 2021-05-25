import { Injectable, Logger } from '@nestjs/common';
import { Client, Channel, VoiceChannel, VoiceConnection } from 'discord.js';
import { Readable } from 'stream';
import { format } from 'util';

const isVoiceChannel = (channel: Channel): channel is VoiceChannel =>
  channel.type === 'voice';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private client: Client) {
    this.client.on('debug', (...args) => this.logger.debug(format(...args)));
  }

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

  getConnection = (channelId: string): VoiceConnection | undefined => {
    return this.client.voice.connections.find(
      (c) => c.channel.id === channelId,
    );
  };

  play = (channelId: string, stream: Readable) => {
    const conn = this.getConnection(channelId);
    if (conn) {
      const dispatcher = conn.play(stream, { type: 'webm/opus' });
      dispatcher.once('finish', () => {
        this.leave(channelId);
      });
      return true;
    }

    this.logger.debug('Unable to play stream: voice not connected');
    return false;
  };

  stop = (channelId: string) => {
    const conn = this.getConnection(channelId);
    if (conn) {
      conn.dispatcher?.destroy();
      return true;
    }

    this.logger.debug('Unable to stop stream: voice not connected');
    return false;
  };

  pause = (channelId: string) => {
    const conn = this.getConnection(channelId);
    if (conn) {
      conn.dispatcher.pause();
      return true;
    }

    this.logger.debug('Unable to pause stream: voice not connected');
    return false;
  };

  // TODO: resume does not work :shrug:
  resume = (channelId: string) => {
    const conn = this.getConnection(channelId);
    if (conn) {
      conn.dispatcher.resume();
      return true;
    }

    this.logger.debug('Unable to resume stream: voice not connected');
    return false;
  };

  join = async (channelId: string): Promise<VoiceConnection> => {
    const conn = this.getConnection(channelId);
    if (conn) {
      this.logger.verbose('Not joining: already connected');
      return conn;
    }

    const channel = await this.client.channels.fetch(channelId);
    if (!isVoiceChannel(channel)) {
      throw new Error('Can not join non-voice channels');
    }

    return channel.join();
  };

  leave = async (channelId: string): Promise<boolean> => {
    const conn = this.getConnection(channelId);
    if (conn) {
      await conn.channel.leave();
      return true;
    }

    this.logger.debug('Unable to leave channel: voice not connected');
    return false;
  };
}
