import { Injectable, Logger } from '@nestjs/common';
import { Channel, Client, VoiceChannel } from 'discord.js';
import { Readable } from 'stream';
import { format } from 'util';
import { ConfigService } from '@nestjs/config';

const isVoiceChannel = (channel: Channel): channel is VoiceChannel =>
  channel.type === 'voice';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private readonly _client: Client,
    private readonly config: ConfigService,
  ) {
    //this._client.on('debug', (...args) => this.logger.verbose(format(...args)));
  }

  private get client(): Promise<Client> {
    if (this._client.readyAt) {
      return Promise.resolve(this._client);
    }

    this.logger.debug('Logging in...');
    return this._client
      .login(this.config.get('DISCORD_BOT_TOKEN'))
      .then(() => this._client);
  }

  voiceConnections = async () => {
    const connections = (await this.client).voice?.connections;
    if (!connections) {
      return [];
    }

    return connections.map((c) => {
      return {
        id: c.voice!.id,
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

  private getConnection = async (channelId: string) => {
    return (await this.client).voice?.connections.find(
      (c) => c.channel.id === channelId,
    );
  };

  play = async (channelId: string, stream: Readable, onFinish?: () => void) => {
    const conn = await this.getConnection(channelId);
    if (conn) {
      const dispatcher = conn.play(stream, { type: 'webm/opus' });
      if (onFinish) {
        dispatcher.once('finish', onFinish);
      }
      return true;
    }

    this.logger.debug('Unable to play play: voice not connected');
    return false;
  };

  stop = async (channelId: string) => {
    const conn = await this.getConnection(channelId);
    if (conn) {
      this.logger.debug('Destroying dispatcher');
      conn.dispatcher?.destroy();
      return true;
    }

    this.logger.debug('Unable to stop play: voice not connected');
    return false;
  };

  pause = async (channelId: string) => {
    const conn = await this.getConnection(channelId);
    if (conn) {
      conn.dispatcher.pause();
      return true;
    }

    this.logger.debug('Unable to pause play: voice not connected');
    return false;
  };

  resume = async (channelId: string) => {
    const conn = await this.getConnection(channelId);
    if (conn) {
      conn.dispatcher.resume();

      // Hacky workaround: https://github.com/discordjs/discord.js/issues/5300
      conn.dispatcher.pause();
      conn.dispatcher.resume();

      return true;
    }

    this.logger.debug('Unable to resume play: voice not connected');
    return false;
  };

  join = async (channelId: string): Promise<boolean> => {
    const conn = await this.getConnection(channelId);
    if (conn) {
      this.logger.verbose('Not joining: already connected');
      return true;
    }

    const channel = await (await this.client).channels.fetch(channelId);
    if (!isVoiceChannel(channel)) {
      throw new Error('Can not join non-voice channels');
    }

    await channel.join();

    return true;
  };

  leave = async (channelId: string): Promise<boolean> => {
    const conn = await this.getConnection(channelId);
    if (conn) {
      await conn.channel.leave();
      return true;
    }

    this.logger.debug('Unable to leave channel: voice not connected');
    return false;
  };
}
