import { BatchManager } from "./batchManager";
import {
  BUFFER_MAX_SIZE,
  RETRY_SEND_LOGS_TIMEOUT,
  SEND_LOGS_TIMEOUT,
} from "./const";
import { TrackerRequest } from "./request";
import { BatchItem, TrackLoggerEvent, Tracker } from "./types";

class TrackerLogger implements Tracker {
  private batchManager: BatchManager<TrackLoggerEvent>;

  private outStandingBuffer = new Set<BatchItem<TrackLoggerEvent>>();

  constructor() {
    this.batchManager = new BatchManager({
      maxMessages: BUFFER_MAX_SIZE,
      maxWaitTimeMilliseconds: SEND_LOGS_TIMEOUT,
    });

    this.batchManager.on((data) => this.sendLogs(data));
  }

  init(): void {
    window.addEventListener("beforeunload", () => {
      this.close();
    });
  }

  track(event: string, ...tags: string[]): void {
    const buildedEvent = this.buildEvent(event, tags);

    this.handleMessage(buildedEvent);
  }

  handleMessage(buildedEvent: TrackLoggerEvent) {
    const task = this.batchManager.add(buildedEvent);
    console.log("add");
    this.outStandingBuffer.add(task);
    task.deferred.promise.finally(() => {
      console.log("delete");
      this.outStandingBuffer.delete(task);
    });
  }

  private close() {
    this.batchManager.unsubscribe();
    const batchFromBuffer = this.batchManager.pop();
    const batchSet = new Set<BatchItem<TrackLoggerEvent>>(batchFromBuffer);
    this.outStandingBuffer.forEach((item) => batchSet.add(item));
    const batch = Array.from(batchSet);
    if (batch.length === 0) {
      return;
    }

     this.sendLogs(batch);
  }

  private async sendLogs(buffer: BatchItem<TrackLoggerEvent>[]): Promise<void> {
    try {
      await TrackerRequest.sendEvents(buffer);

      buffer.forEach((el) => {
        console.log("resolve try");
        el.deferred.resolve();
      });
    } catch {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, RETRY_SEND_LOGS_TIMEOUT),
      );
      buffer.forEach((el) => {
        console.log("resolve catch");
        el.deferred.resolve();
      });
      //Let all microtask resolve before adding into events to outStandingBuffer
      await Promise.resolve();

      buffer.forEach((el) => {
        this.handleMessage(el.message);
      });
    }
  }

  private buildEvent(event: string, tags: string[]): TrackLoggerEvent {
    return {
      event,
      tags,
      url: window.location.href,
      title: document.title,
      ts: Math.floor(Date.now() / 1000),
    };
  }
}

export { TrackerLogger };
