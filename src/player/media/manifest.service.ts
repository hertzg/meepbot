import { Injectable } from '@nestjs/common';
import { createWriteStream, readFileSync, WriteStream } from 'fs';

const PATH_DATA = './cache/manifest.txt';

@Injectable()
export class ManifestService {
  private _temp: string[] | null;
  private readonly stream: WriteStream;

  constructor() {
    this._temp = this.loadSync();
    this.stream = createWriteStream(PATH_DATA, {
      encoding: 'utf-8',
      flags: 'a',
      highWaterMark: 1,
    });
  }

  private loadSync = () =>
    readFileSync(PATH_DATA, { encoding: 'utf-8', flag: 'as+' })
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length);

  once = () => {
    const keys = this._temp;
    this._temp = undefined;
    return keys;
  };

  append = (key) => this.stream.write(key + '\n');
}
