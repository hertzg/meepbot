import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from './storage.service';
import { PassThrough, Readable, Writable } from 'stream';
import { ManifestService } from './manifest.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly persisted: Map<string, boolean> = new Map();

  constructor(private readonly storage: StorageService) {
    this.storage
      .readManifestOnce()
      .forEach((key) => this.persisted.set(key, true));
  }

  cache = () => {
    return Object.fromEntries(
      Array.from(this.persisted.entries()).map(([k, v]) => [
        k,
        v ? 'persisted' : 'downloading',
      ]),
    );
  };

  createWriteStream = (key: string): Writable | undefined => {
    const isPersisted = this.persisted.has(key);
    if (isPersisted) {
      this.logger.log(`A blob is either persisted or downloading for ${key}`);
      return;
    }

    const pass = new PassThrough();
    pass.pipe(this.storage.createWriteStream(key));
    this.logger.log(`Marking blob as downloading for ${key}`);
    this.persisted.set(key, false);

    pass.once('end', () => {
      this.storage.persist(key);
      this.persisted.set(key, true);
      this.logger.log(`Marking blob as persisted for ${key}`);
    });

    return pass;
  };

  createReadStream = (key: string): Readable | undefined => {
    if (this.persisted.get(key)) {
      this.logger.log(`Reading from the cached blob for ${key}`);
      return this.storage.createReadStream(key);
    }

    this.logger.log(`A cached blob does not exist for ${key}`);
    return;
  };
}
