import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { CacheService } from './cache.service';
import Got from 'got';

@Injectable()
export class DownloadService {
  constructor(private readonly cache: CacheService) {}

  fetchCached = (key: string): Readable | undefined => {
    const fromCache = this.cache.createReadStream(key);
    if (fromCache) {
      return fromCache;
    }
  };

  fetchAndCache = (key: string, url: string): Readable => {
    const cacheStream = this.cache.createWriteStream(key);
    if (cacheStream) {
      this.fetchReadStream(url).pipe(cacheStream);
    }

    return this.fetchReadStream(url);
  };

  private fetchReadStream = (url: string): Readable => {
    return Got.stream({ url });
  };
}
