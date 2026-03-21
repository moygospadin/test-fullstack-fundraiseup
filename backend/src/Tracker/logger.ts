import { BatchManager } from "./BatchManager";
import { BUFFER_MAX_SIZE, SEND_LOGS_TIMEOUT } from "./const";
import { TrackerRequest } from "./request";
import { BatchItem, TrackLoggerEvent } from "./types";

class TrackerLogger {
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
    const task = this.batchManager.add(this.buildEvent(event, tags));
    this.outStandingBuffer.add(task);
    task.deferred.promise.finally(() => {
      this.outStandingBuffer.delete(task);
    });
  }

  private close() {
    Object.values(this.outStandingBuffer).forEach((el) =>
      this.batchManager.add(el),
    );
    this.batchManager.flush();
  }

  private async sendLogs(buffer: BatchItem<TrackLoggerEvent>[]): Promise<void> {
    try {
      await TrackerRequest.sendEvents(buffer);

      buffer.forEach((el) => el.deferred.resolve());
    } catch {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, 1000),
      );
      buffer.forEach((el) => {
        el.deferred.reject();
        this.batchManager.add(el.message);
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
