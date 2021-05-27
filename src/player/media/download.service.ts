import { Injectable, Logger } from '@nestjs/common';
import Got, { GotStream, Progress } from 'got';
import { nanoid } from 'nanoid/async';
import prettyBytes from 'pretty-bytes';
import { throttle } from '@github/mini-throttle';
import { format } from 'util';

const formatProgress = (p: Progress) => ({
  transferred: prettyBytes(p.transferred),
  total: p.total ? prettyBytes(p.total) : '? B',
  percent: Math.round(p.percent * 100),
});

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  private readonly progress = new Map<string, Progress>();

  private handleProgress = (id: string, progress: Progress) => {
    this.progress.set(id, progress);
  };

  private handleFinish = (id: string) => {
    this.progress.delete(id);
  };

  private trackProgress = async (
    stream: ReturnType<GotStream>,
    _id?: string,
  ) => {
    const id = _id ?? `unknown-${await nanoid()}`;
    this.logger.verbose(`[${id}] download: started`);
    const logProgress = throttle((p: Progress) => {
      const { percent, transferred, total } = formatProgress(p);
      this.logger.debug(
        `[${id}] Received (${percent}%) ${transferred} / ${total} `,
      );
    }, 30000);

    const progressListener = (progress: Progress) => {
      this.handleProgress(id, progress);
      logProgress(progress);
    };

    const finishListener = (err?: any) => {
      if (err) {
        this.logger.error(`[${id}] error: ${format(err)}`);
      } else {
        this.logger.log(`[${id}] download: finished`);
      }
      stream.removeListener('downloadProgress', progressListener);
      stream.removeListener('error', finishListener);
      stream.removeListener('finish', finishListener);
      this.handleFinish(id);
    };

    stream.on('downloadProgress', progressListener);
    stream.once('error', finishListener);
    stream.once('end', finishListener);
    return id;
  };

  stream = async (url: string, key?: string) => {
    const stream = Got.stream({
      isStream: true,
      url,
    });
    await this.trackProgress(stream, key);
    return stream;
  };
}
