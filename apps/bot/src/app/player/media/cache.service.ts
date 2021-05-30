import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ManifestService } from './manifest.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  private readonly writing = new Set<string>();

  constructor(
    private readonly storage: StorageService,
    private readonly manifest: ManifestService
  ) {}

  private has = async (key: string) => this.manifest.has(key);

  createReadStream = async (key: string) => {
    if (await this.has(key)) {
      this.logger.debug(`[Read] HIT: ${key}`);
      return this.storage.createReadStream(key);
    }

    this.logger.log(`[Read] MISS: ${key}`);
    return;
  };

  createWriteStream = async (key: string) => {
    if (await this.has(key)) {
      this.logger.debug(`[${key}] write: already persisted`);
      return;
    }

    if (this.writing.has(key)) {
      this.logger.debug(`[${key}] write: already writing`);
      return;
    }

    this.writing.add(key);
    this.logger.debug(`[${key}] write: opening storage for writing`);
    const writable = this.storage.createWriteStream(key);
    writable.once('finish', () => {
      this.logger.debug(`[${key}] write: finished writing`);
      this.manifest.add(key);
      this.writing.delete(key);
    });
    return writable;
  };
}
