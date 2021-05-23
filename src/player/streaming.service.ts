import { Injectable } from '@nestjs/common';
import * as MiniGet from 'miniget';
import { Readable } from 'stream';

@Injectable()
export class StreamingService {
  async createReadStream(url: string): Promise<Readable> {
    const stream = MiniGet(url);
    return stream;
  }
}
