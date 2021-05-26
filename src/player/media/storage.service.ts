import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { Readable, Writable } from 'stream';
import {
  createReadStream,
  createWriteStream,
  promises as fsPromises,
} from 'fs';

const hash = (s: string) => createHash('sha1').update(s).digest('hex');
const temp = (key: string) => `${PATH_TEMP}/${hash(key)}`;
const blob = (key: string) => `${PATH_BLOB}/${hash(key)}`;

const PATH_BLOB = `./cache/blob`;
const PATH_TEMP = `./cache/temp`;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

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
