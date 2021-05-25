import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { PlaylistService } from './playlist.service';
import { AudioService, AudioState } from './audio.service';
import { MediaService } from './media/media.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly discord: DiscordService,
    private readonly media: MediaService,
    private readonly audio: AudioService,
    private readonly playlist: PlaylistService,
  ) {}

  playNow = async (channelId: string, link: string) => {
    const prevState = this.audio.getState(channelId);
    switch (prevState) {
      case undefined:
      case AudioState.READY:
      case AudioState.PAUSED:
      case AudioState.PLAYING:
        await this.stop(channelId);
        await this.autoPlay(channelId, link);
        break;
    }

    return [prevState, this.audio.getState(channelId)];
  };

  autoPlay = async (channelId: string, link: string) => {
    const stream = await this.media.streamYouTubeVideo(link);
    await this.audio.connect(channelId);

    const played = await this.audio.play(channelId, stream, () =>
      this.autoNext(channelId),
    );

    if (!played) {
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

  stop = async (channelId: string) => {
    this.playlist.deleteQueue(channelId);
    return this.audio.stop(channelId);
  };
}
