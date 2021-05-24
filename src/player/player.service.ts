import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { YouTubeService } from './media/youtube/youtube.service';
import { DownloadService } from './media/download.service';
import { MediaService } from './media/media.service';

@Injectable()
export class PlayerService {
  constructor(private discord: DiscordService, private media: MediaService) {}

  async play(channelId: string, link: string) {
    const [stream] = await Promise.all([
      this.media.fromYouTube(link),
      this.discord.join(channelId),
    ]);

    return this.discord.play(channelId, stream);
  }

  async pause(channelId: string) {
    return this.discord.pause(channelId);
  }

  async resume(channelId: string) {
    return this.discord.resume(channelId);
  }

  async stop(channelId: string) {
    return this.discord.leave(channelId);
  }
}
