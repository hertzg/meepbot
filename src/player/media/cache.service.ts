import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ManifestService } from './manifest.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  private readonly writing = new Set<string>();

  constructor(
    private readonly storage: StorageService,
    private readonly manifest: ManifestService,
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
      this.logger.debug(`[Write] Already persisted: ${key}`);
      return;
    }

    if (this.writing.has(key)) {
      this.logger.debug(`[Write] Already writing: ${key}`);
      return;
    }

    this.logger.debug(`[Write] Creating write stream: ${key}`);
    const writable = this.storage.createWriteStream(key);
    writable.once('end', () => this.manifest.add(key));
    return writable;
  };
}
