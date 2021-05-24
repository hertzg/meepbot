import { Injectable } from '@nestjs/common';
import { YouTubeService } from './youtube/youtube.service';
import { DownloadService } from './download.service';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  constructor(
    private readonly youtube: YouTubeService,
    private readonly download: DownloadService,
  ) {}

  fromYouTube = async (link: string): Promise<Readable> => {
    const cached = this.download.fetchCached(link);
    if (cached) {
      return cached;
    }

    const url = await this.youtube.fetchAudioOnlyUrl(link);
    return this.download.fetchAndCache(link, url);
  };
}