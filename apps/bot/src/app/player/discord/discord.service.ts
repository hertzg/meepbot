import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Channel, Client, VoiceChannel } from 'discord.js';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { format } from 'util';

const isVoiceChannel = (channel: Channel): channel is VoiceChannel =>
  channel.type === 'voice';

const isInvalidTokenError = (e: any) => e.code === 'TOKEN_INVALID';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private readonly _client: Client,
    private readonly config: ConfigService
  ) {
    this._client.on('debug', (...args) => this.logger.verbose(format(...args)));
  }

  onApplicationBootstrap = async () => {
    try {
      await this.client;
    } catch (e) {
      console.log(e);
      if (isInvalidTokenError(e)) {
        this.logger.error(e);
      }

      process.exit(1);
      throw e;
    }
  };

  private get client(): Promise<Client> {
    if (this._client.readyAt) {
      return Promise.resolve(this._client);
    }

    this.logger.debug('Logging in...');
    return this._client
      .login(this.config.get('DISCORD_BOT_TOKEN'))
      .then(() => this._client);
  }

  private getConnection = async (channelId: string) => {
    return (await this.client).voice?.connections.find(
      (c) => c.channel.id === channelId
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
