import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { PlaylistService } from './playlist.service';
import { PlaybackService } from './playback.service';

export const enum PlayerState {
  CONNECTED,
  PAUSED,
  PLAYING,
}

@Injectable()
export class PlayerService {
  private readonly state = new Map<string, PlayerState>();

  constructor(
    private readonly discord: DiscordService,
    private readonly playback: PlaybackService,
    private readonly playlist: PlaylistService,
  ) {}

  playNow = async (channelId: string, link?: string) => {
    const prevState = this.state.get(channelId);
    switch (prevState) {
      case undefined:
      case PlayerState.CONNECTED:
      case PlayerState.PAUSED:
      case PlayerState.PLAYING:
        await this.stop(channelId);
        await this.autoPlay(channelId, link);
        if (link) {
          this.playlist.enqueue(channelId, link);
        }
        break;
    }

    return [prevState, this.state.get(channelId)];
  };

  autoPlay = async (channelId: string, link: string) => {
    const played = await this.playback.play(channelId, link);
    if (played) {
      this.discord
        .getConnection(channelId)
        .dispatcher.once('finish', () => this.autoNext(channelId));
    } else {
      await this.autoNext(channelId);
    }

    return played;
  };

  autoNext = async (channelId: string) => {
    const next = this.playlist.dequeue(channelId);
    if (next) {
      await this.autoNext(channelId);
      return;
    }

    await this.stop(channelId);
    return;
  };

  playPause = async (channelId: string) => {
    const playerState = this.state.get(channelId);
    switch (playerState) {
      case PlayerState.PAUSED:
        return {
          resume: this.resume(channelId),
        };

      case PlayerState.PLAYING:
        return {
          pause: this.pause(channelId),
        };
    }
  };

  pause = async (channelId: string) => {
    if (this.state.get(channelId) === PlayerState.PLAYING) {
      const paused = this.playback.pause(channelId);
      this.state.set(channelId, PlayerState.PAUSED);
      return paused;
    }
    return false;
  };

  resume = async (channelId: string) => {
    if (this.state.get(channelId) === PlayerState.PAUSED) {
      this.state.set(channelId, PlayerState.PLAYING);
      return this.playback.resume(channelId);
    }
  };

  stop = async (channelId: string) => {
    const stopped = await this.playback.stop(channelId);
    if (stopped) {
      this.state.delete(channelId);
      this.playlist.deleteQueue(channelId);
    }
    return stopped;
  };
}
