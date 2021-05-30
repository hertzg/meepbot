import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { createAppendStream } from './createAppendStream';
import { format } from 'util';
import { Writable } from 'stream';
import assert from 'assert';
import mkdirp from 'mkdirp';
import { environment } from '../../../environments/environment';
import { join } from 'path';

const FILENAME = 'manifest.txt';

@Injectable()
export class ManifestService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ManifestService.name);

  private _entries?: string[];
  private _writer?: Writable;

  onApplicationBootstrap = async () => {
    await mkdirp(environment.cachePath);
    const path = join(environment.cachePath, FILENAME);
    const [data, writer] = await createAppendStream(path);
    this._writer = writer;
    this._entries = data
      .toString('utf-8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length);

    this.logger.log(`loaded ${this._entries} entries from file`);
    return [data, writer] as const;
  };

  private append = async (entry: string) => {
    assert(this._entries, 'entries not initialized');
    assert(this._writer, 'no writable stream present');

    this.logger.debug(`append: ${format(entry)}`);
    this._writer.write(`${entry}\n`);
    this._entries.push(entry);
  };

  add = async (entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed.length) {
      return;
    }

    await this.append(trimmed);
  };

  has = async (entry: string) => {
    assert(this._entries, 'entries not initialized');
    return this._entries.includes(entry.trim());
  };
}
