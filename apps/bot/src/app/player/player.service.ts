import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { PlaylistService } from './playlist.service';
import { AudioService, AudioState } from './audio.service';
import { MediaService } from './media/media.service';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(
    private readonly discord: DiscordService,
    private readonly media: MediaService,
    private readonly audio: AudioService,
    private readonly playlist: PlaylistService
  ) {}

  playNow = async (channelId: string, watchUrls: string[]) => {
    const prevState = this.audio.getState(channelId);
    switch (prevState) {
      case undefined:
      case AudioState.READY:
      case AudioState.PAUSED:
      case AudioState.PLAYING:
        await this.stop(channelId);
        this.playlist.enqueueAll(channelId, watchUrls);
        await this.autoPlayNext(channelId);
        break;
    }

    return [prevState, this.audio.getState(channelId)];
  };

  playTemp = async (channelId: string, watchUrls: string[]) => {
    const prevState = this.audio.getState(channelId);
    this.playlist.unshiftAll(channelId, watchUrls);
    await this.autoPlayNext(channelId);
    return [prevState, this.audio.getState(channelId)];
  };

  private autoPlay = async (channelId: string, link: string) => {
    const stream = await this.media.streamYouTubeWatchLink(link);
    if (!stream) {
      this.logger.log(`[${channelId}] autoPlay: no opus stream, playNext`);
      await this.autoPlayNext(channelId);
      return false;
    }

    await this.audio.connect(channelId);
    this.logger.verbose(`[${channelId}] autoPlay: play audio`);
    const played = await this.audio.play(channelId, stream, () => {
      this.logger.verbose(`[${channelId}] autoPlay: audio finished`);
      this.autoPlayNext(channelId);
    });

    if (!played) {
      this.logger.debug(`[${channelId}] autoPlay: audio not played, playNext`);
      await this.autoPlayNext(channelId);
    }

    return played;
  };

  private autoPlayNext = async (channelId: string) => {
    const next = this.playlist.dequeue(channelId);
    if (next) {
      this.logger.debug(`[${channelId}] autoPlayNext: now playing ${next}`);
      await this.autoPlay(channelId, next);
    } else {
      this.logger.debug(
        `[${channelId}] autoPlayNext: playlist exhausted, stopping`
      );
      await this.stop(channelId);
    }
  };

  togglePause = async (channelId: string) => {
    const audioState = this.audio.getState(channelId);
    switch (audioState) {
      case AudioState.PAUSED:
        return {
          resume: this.resume(channelId),
        };

      case AudioState.PLAYING:
        return {
          pause: this.pause(channelId),
        };
    }
  };

  pause = async (channelId: string) => this.audio.pause(channelId);

  resume = async (channelId: string) => this.audio.resume(channelId);

  skip = async (channelId: string) => this.autoPlayNext(channelId);

  stop = async (channelId: string) => {
    this.playlist.deleteQueue(channelId);
    return this.audio.stop(channelId);
  };
}
