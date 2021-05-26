import { Injectable, Logger } from '@nestjs/common';
import { YouTubeService } from './youtube/youtube.service';
import { DownloadService } from './download.service';
import { CacheService } from './cache.service';
import { nanoid } from 'nanoid';
import { watch } from 'fs';

const cacheKey = (prefix: string, key: string) => `${prefix}/${key}`;

export interface YouTubeLinkInfo {
  url: {
    url: string;
    type: 'playlist' | 'watch';
    id: string;
  };
  watchUrls: string[];
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly youtube: YouTubeService,
    private readonly cache: CacheService,
    private readonly download: DownloadService,
  ) {}

  fetchYouTubeLink = async (url: string): Promise<YouTubeLinkInfo> => {
    let id: string;
    let type: 'playlist' | 'watch';
    const watchLinks: string[] = [];
    const plId = await this.youtube.extractPlaylistId(url);
    if (plId) {
      id = plId;
      type = 'playlist';
      watchLinks.push(...(await this.youtube.playlistWatchLinks(url)));
    } else {
      id = await this.youtube.extractVideoId(url);
      type = 'watch';
      watchLinks.push(url);
    }

    return {
      url: {
        url,
        id,
        type,
      },
      watchUrls: watchLinks,
    };
  };

  cacheYouTubeWatchLink = async (watchUrl: string, id: string) => {
    const key = cacheKey(
      'youtube',
      await this.youtube.extractVideoId(watchUrl),
    );
    const cached = await this.cache.createReadStream(key);
    if (cached) {
      cached.destroy();
      return true;
    }

    const cacheStream = await this.cache.createWriteStream(key);
    if (cacheStream) {
      this.logger.debug('Streaming to cache');
      const mediaUrl = await this.youtube.mediaUrl(watchUrl);

      if (!mediaUrl) {
        this.logger.log('Unable to retrieve media url');
        return false;
      }

      const stream = await this.download.stream(mediaUrl, `cache-${id}`);
      stream.pipe(cacheStream);
    }

    return false;
  };

  /**
   * Creates a Readable OPUS Audio Only play from a YouTube watch url
   * @param watchUrl full youtube watch url
   */
  streamYouTubeWatchLink = async (watchUrl: string) => {
    const id = nanoid();
    const key = cacheKey(
      'youtube',
      await this.youtube.extractVideoId(watchUrl),
    );
    const cached = await this.cacheYouTubeWatchLink(watchUrl, id);
    if (cached) {
      return (await this.cache.createReadStream(key))!;
    }

    this.logger.debug('Streaming to player');
    const mediaUrl = await this.youtube.mediaUrl(watchUrl);

    if (!mediaUrl) {
      this.logger.debug('No opus stream found');
      return;
    }

    return await this.download.stream(mediaUrl, `stream-${id}`);
  };
}
