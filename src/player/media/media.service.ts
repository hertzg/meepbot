import { Injectable, Logger } from '@nestjs/common';
import { YouTubeService } from './youtube/youtube.service';
import { DownloadService } from './download.service';
import { CacheService } from './cache.service';
import { PassThrough, Readable } from 'stream';

const cacheKey = (prefix: string, key: string) => `${prefix}/${key}`;

export interface YouTubeLink {
  link: {
    url: string;
    type: 'playlist' | 'video';
    id: string;
  };
  videos: string[];
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly youtube: YouTubeService,
    private readonly cache: CacheService,
    private readonly download: DownloadService,
  ) {}

  fromYouTubeLink = async (url: string): Promise<YouTubeLink> => {
    let id: string;
    let type: 'playlist' | 'video';
    const videos: string[] = [];
    const plId = await this.youtube.playlistId(url);
    if (plId) {
      id = plId;
      type = 'playlist';
      videos.push(...(await this.youtube.playlistVideos(url)));
    } else {
      id = await this.youtube.videoId(url);
      type = 'video';
      videos.push(url);
    }

    return {
      link: {
        url,
        id,
        type,
      },
      videos,
    };
  };

  /**
   * Creates a Readable OPUS Audio Only play from a YouTube video link
   * @param link full youtube video link
   */
  streamVideoLink = async (link: string) => {
    const key = cacheKey('youtube', await this.youtube.videoId(link));
    const cached = await this.cache.createReadStream(key);
    if (cached) {
      return cached;
    }

    const [media, cacheStream] = await Promise.all([
      this.youtube.videoMediaUrl(link),
      this.cache.createWriteStream(key),
    ]);

    if (cacheStream) {
      this.logger.debug('Streaming to cache');
      (await this.download.stream(media)).pipe(cacheStream);
    }

    this.logger.debug('Streaming to player');
    return await this.download.stream(media);
  };
}
