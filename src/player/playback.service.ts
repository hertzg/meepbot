import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { MediaService } from './media/media.service';

@Injectable()
export class PlaybackService {
  private readonly logger = new Logger(PlaybackService.name);

  constructor(
    private readonly discord: DiscordService,
    private readonly media: MediaService,
  ) {}

  play = async (channelId: string, link: string) => {
    this.logger.debug(`Starting playback on ${channelId} channel`);
    const [stream] = await Promise.all([
      this.media.streamYouTubeVideo(link),
      this.discord.join(channelId),
    ]);

    return this.discord.play(channelId, stream);
  };

  pause = async (channelId: string) => {
    this.logger.debug(`Pausing playback on ${channelId} channel`);
    return this.discord.pause(channelId);
  };

  resume = async (channelId: string) => {
    this.logger.debug(`Resuming playback on ${channelId} channel`);
    return this.discord.resume(channelId);
  };

  stop = async (channelId: string) => {
    this.logger.debug(`Stopping playback on ${channelId} channel`);
    return this.discord.stop(channelId);
  };
}
