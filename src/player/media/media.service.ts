import { Injectable } from '@nestjs/common';
import { YouTubeService } from './youtube/youtube.service';
import { DownloadService } from './download.service';
import { CacheService } from './cache.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly youtube: YouTubeService,
    private readonly cache: CacheService,
    private readonly download: DownloadService,
  ) {}

  /**
   * Creates a Readable OPUS Audio Only play from a YouTube video link
   * @param link full youtube video link
   */
  streamYouTubeVideo = async (link: string) => {
    const cached = await this.cache.createReadStream(link);
    if (cached) {
      return cached;
    }

    const [media, cacheStream] = await Promise.all([
      this.youtube.videoMediaUrl(link),
      this.cache.createWriteStream(link),
    ]);

    if (cacheStream) {
      (await this.download.stream(media)).pipe(cacheStream);
    }

    return await this.download.stream(media);
  };
}
