import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from './discord/discord.service';
import { YouTubeService } from './youtube/youtube.service';
import { StreamingService } from './streaming.service';

@Injectable()
export class PlayerService {
  constructor(
    private discord: DiscordService,
    private youtube: YouTubeService,
    private streamer: StreamingService,
  ) {}

  async play(channelId: string, link: string) {
    const [url] = await Promise.all([
      this.youtube.fetchAudioOnlyUrl(link),
      this.discord.join(channelId),
    ]);

    const stream = await this.streamer.createReadStream(url);
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
