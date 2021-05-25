import { Injectable } from '@nestjs/common';
import { createAppendStream } from './createAppendStream';
import * as mem from 'mem';

const PATH_DATA = './cache/manifest.txt';

const useAppender = mem(createAppendStream);

@Injectable()
export class ManifestService {
  private _entries?: string[];

  private ensureReady = async () => {
    const [data, writer] = await useAppender(PATH_DATA);
    this._entries = data
      .toString('utf-8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length);

    return writer;
  };

  private append = async (entry: string) => {
    (await this.ensureReady()).write(entry);
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
