import { Injectable, Logger } from '@nestjs/common';
import { PlayerService } from './player.service';

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlayerService.name);
  private readonly queues = new Map<string, string[]>();

  deleteQueue(key: string) {
    this.logger.debug(`[${key}] Clear`);
    this.queues.delete(key);
  }

  private ensureQueue(key: string) {
    if (!this.queues.has(key)) {
      this.queues.set(key, []);
    }

    return this.queues.get(key) as string[];
  }

  unshiftAll(key: string, items: string[]): string[] {
    this.logger.debug(`[${key}] UnshiftAll: Unshifted ${items.length} items`);
    const queue = this.ensureQueue(key);
    queue.unshift(...items);
    return queue;
  }

  enqueueAll(key: string, items: string[]): string[] {
    this.logger.debug(`[${key}] PushAll: Pushed ${items.length} items`);
    const queue = this.ensureQueue(key);
    queue.push(...items);
    return queue;
  }

  dequeue(key: string): string | undefined {
    const queue = this.ensureQueue(key);
    const next = queue.shift();
    this.logger.debug(`[${key}] Shift: ${next}`);
    return next;
  }
}
