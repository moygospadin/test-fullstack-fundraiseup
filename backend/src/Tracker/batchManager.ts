import { BatchItem, BatchManagerOptions } from "./types";
import { promiseWithResolvers } from "./utils";

class BatchManager<T> {
  private buffer: BatchItem<T>[] = [];
  private timer: number | null = null;

  private listener: ((batch: BatchItem<T>[]) => Promise<void>) | null = null;

  constructor(private readonly options?: BatchManagerOptions) {}

  public on(handler: (batch: BatchItem<T>[]) => Promise<void>) {
    this.listener = handler;
  }

  public add(message: T): BatchItem<T> {
    const deferred = promiseWithResolvers<void>();
    const bufferMessage = { deferred, message };
    this.buffer.push(bufferMessage);

    if (this.buffer.length >= this.options!.maxMessages) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        void this.flush();
      }, this.options!.maxWaitTimeMilliseconds);
    }

    return bufferMessage;
  }

  public async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) {
      return;
    }

    const batch = this.buffer;
    this.buffer = [];

    if (this.listener) {
      await this.listener(batch);
    }
  }
}

export { BatchManager };
