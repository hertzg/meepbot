import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { Readable, Writable } from 'stream';
import {
  createReadStream,
  createWriteStream,
  promises as fsPromises,
} from 'fs';
import { ManifestService } from './manifest.service';

const hashKey = (s: string) => createHash('sha1').update(s).digest('hex');

const PATH_BLOB = `./cache/blob`;
const PATH_TEMP = `./cache/temp`;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly manifest: ManifestService) {}

  readManifestOnce = () => this.manifest.once();

  keyToTempPath = (key: string) => `${PATH_TEMP}/${hashKey(key)}`;
  keyToBlobPath = (key: string) => `${PATH_BLOB}/${hashKey(key)}`;

  createWriteStream = (key: string): Writable => {
    const path = this.keyToTempPath(key);
    this.logger.log(`writing blob to ${path}`);
    return createWriteStream(path);
  };

  createReadStream = (key: string): Readable => {
    const path = this.keyToBlobPath(key);
    this.logger.log(`reading blob from ${path}`);
    return createReadStream(path);
  };

  persist = async (key: string) => {
    this.manifest.append(key);
    const tempPath = this.keyToTempPath(key);
    const blobPath = this.keyToBlobPath(key);
    this.logger.log(`persisting blob ${tempPath} as ${blobPath}`);
    await fsPromises.rename(tempPath, blobPath);
  };
}
