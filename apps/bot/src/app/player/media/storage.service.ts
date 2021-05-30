import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { createHash } from 'crypto';
import { Readable, Writable } from 'stream';
import {
  createReadStream,
  createWriteStream,
  promises as fsPromises,
} from 'fs';
import mkdirp from 'mkdirp';
import { environment } from '../../../environments/environment';
import { join } from 'path';

const PATH_BLOB = `./blobs`;
const PATH_TEMP = `./temps`;

const hash = (s: string) => createHash('sha1').update(s).digest('hex');
const temp = (key: string) => join(environment.cachePath, PATH_TEMP, hash(key));
const blob = (key: string) => join(environment.cachePath, PATH_BLOB, hash(key));

@Injectable()
export class StorageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StorageService.name);

  onApplicationBootstrap = async () => {
    await Promise.all([
      mkdirp(join(environment.cachePath, PATH_BLOB)),
      mkdirp(join(environment.cachePath, PATH_TEMP)),
    ]);
  };

  createReadStream = (key: string): Readable => {
    const path = blob(key);
    this.logger.verbose(`[${key}] reading ${path}`);
    return createReadStream(path);
  };

  createWriteStream = (key: string): Writable => {
    this.logger.verbose(`[${key}] writing: started`);
    const stream = createWriteStream(temp(key));
    stream.once('finish', () => {
      this.logger.verbose(`[${key}] writing: finished`);
      this.persist(key);
    });
    return stream;
  };

  private persist = async (key: string) => {
    this.logger.verbose(`[${key}] moving`);
    await fsPromises.rename(temp(key), blob(key));
    this.logger.verbose(`[${key}] persisted`);
  };
}
