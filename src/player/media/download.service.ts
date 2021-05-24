import { Injectable, Logger } from '@nestjs/common';
import * as MiniGet from 'miniget';
import { PassThrough, Readable } from 'stream';
import { CacheService } from './cache.service';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(private readonly cache: CacheService) {}

  fetchCached = (key: string): Readable | undefined => {
    const fromCache = this.cache.createReadStream(key);
    if (fromCache) {
      return fromCache;
    }
  };

  fetchAndCache = (key: string, url: string): Readable => {
    this.logger.log(`Fetching ${url} and caching`);
    const input = this.fetchReadStream(url);

    const cacheStream = this.cache.createWriteStream(key);
    if (cacheStream) {
      input.pipe(this.cache.createWriteStream(key));
    }

    return input.pipe(new PassThrough());
  };

  private fetchReadStream = (url: string): Readable => {
    return MiniGet(url).pipe(new PassThrough());
  };
}
