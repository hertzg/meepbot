import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaylistService {
  private readonly queues = new Map<string, string[]>();

  getQueue(key: string): string[] | undefined {
    return this.queues.get(key);
  }

  deleteQueue(key: string) {
    this.queues.delete(key);
  }

  ensureQueue(key: string): string[] {
    if (!this.queues.has(key)) {
      this.queues.set(key, []);
    }
    return this.getQueue(key);
  }

  enqueue(key: string, item: string): string[] {
    const queue = this.ensureQueue(key);
    queue.push(item);
    return queue;
  }

  dequeue(key: string): string | undefined {
    const queue = this.ensureQueue(key);
    return queue.shift();
  }
}
