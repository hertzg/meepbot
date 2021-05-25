import { Injectable, Logger } from '@nestjs/common';
import Got, { GotStream, Progress } from 'got';
import { nanoid } from 'nanoid/async';
import { throttle } from '@github/mini-throttle';
import prettyBytes from 'pretty-bytes';

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

  private handleAbort = (id: string) => {
    this.progress.delete(id);
  };

  private trackStreamAs = (stream: ReturnType<GotStream>, id: string) => {
    const logProgress = throttle((p: Progress) => {
      const { percent, transferred, total } = formatProgress(p);
      this.logger.debug(
        `[${id}] Received (${percent}%) ${transferred} / ${total} `,
      );
    });

    const progressListener = (progress: Progress) => {
      this.handleProgress(id, progress);
      logProgress(progress);
    };

    const abortListener = () => {
      stream.removeListener('downloadProgress', progressListener);
      stream.removeListener('error', abortListener);
      stream.removeListener('end', abortListener);
      this.handleAbort(id);
    };

    stream.on('downloadProgress', progressListener);
    stream.once('error', abortListener);
    stream.once('end', abortListener);
  };

  stream = async (url: string) => {
    const id = await nanoid();
    const stream = Got.stream({ url });
    this.trackStreamAs(stream, id);
    return stream;
  };
}
