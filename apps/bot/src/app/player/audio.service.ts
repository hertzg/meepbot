import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { Readable } from 'stream';

export const enum AudioState {
  READY,
  PAUSED,
  PLAYING,
}

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  private readonly state = new Map<string, AudioState>();

  constructor(private readonly discord: DiscordService) {}

  getState = (channelId: string) => this.state.get(channelId);

  play = async (channelId: string, stream: Readable, onFinish?: () => void) => {
    this.state.set(channelId, AudioState.PLAYING);
    this.logger.debug(`[${channelId}] Starting`);
    return await this.discord.play(channelId, stream, onFinish);
  };

  pause = async (channelId: string) => {
    this.state.set(channelId, AudioState.PAUSED);
    this.logger.debug(`[${channelId}] Pausing`);
    return await this.discord.pause(channelId);
  };

  resume = async (channelId: string) => {
    this.state.set(channelId, AudioState.PLAYING);
    this.logger.debug(`[${channelId}] Resuming`);
    return await this.discord.resume(channelId);
  };

  stop = async (channelId: string) => {
    this.state.set(channelId, AudioState.READY);
    this.logger.debug(`[${channelId}] Stopping`);
    return await this.discord.stop(channelId);
  };

  connect = async (channelId: string) => {
    this.state.set(channelId, AudioState.READY);
    this.logger.debug(`[${channelId}] Connecting`);
    return await this.discord.join(channelId);
  };

  disconnect = async (channelId: string) => {
    this.state.delete(channelId);
    this.logger.debug(`[${channelId}] Disconnecting`);
    return await this.discord.leave(channelId);
  };
}
