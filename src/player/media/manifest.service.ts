import { Injectable, Logger } from '@nestjs/common';
import { createAppendStream } from './createAppendStream';
import * as mem from 'mem';
import { PathLike } from 'fs';
import { format } from 'util';

const PATH_DATA = './cache/manifest.txt';

@Injectable()
export class ManifestService {
  private readonly logger = new Logger(ManifestService.name);

  private _entries?: string[];

  private useAppender = mem(async (path: PathLike) => {
    const [data, writer] = await createAppendStream(path);
    this.logger.log(`[${path}] init: read ${data.length} bytes`);
    return [data, writer] as const;
  });

  private ensureReady = async () => {
    const [data, writer] = await this.useAppender(PATH_DATA);

    if (!this._entries) {
      this._entries = data
        .toString('utf-8')
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length);
    }

    return writer;
  };

  private append = async (entry: string) => {
    this.logger.debug(`[${PATH_DATA}] append: ${format(entry)}`);
    (await this.ensureReady()).write(`${entry}\n`);
    this._entries!.push(entry);
  };

  add = async (entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed.length) {
      return;
    }

    await this.append(trimmed);
  };

  has = async (entry: string) => {
    await this.ensureReady();
    return this._entries!.includes(entry.trim());
  };
}
