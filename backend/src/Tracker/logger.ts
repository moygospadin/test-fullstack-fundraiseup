import {
  BUFFER_MAX_SIZE,
  COLLECT_BUFFER_TIMEOUT,
  SEND_LOGS_TIMEOUT,
} from "./const";
import { TrackerRequest } from "./request";
import { TrackLoggerEvent } from "./types";

class TrackerLogger {
  private buffer: TrackLoggerEvent[] = [];
  private unprocessedBuffer: TrackLoggerEvent[] = [];

  private retryTimer: number | null = null;
  private collectBufferTimer: number | null = null;

  init(): void {
    window.addEventListener("beforeunload", () => {
      this.collectBuffer();
      this.sendLogs();
    });
    this.sendLogsLoop();
  }

  track(event: string, ...tags: string[]): void {
    this.buffer.push(this.buildEvent(event, tags));

    if (this.buffer.length >= BUFFER_MAX_SIZE) {
      this.sendLogs();
    }
  }

  private nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  private buildEvent(event: string, tags: string[]): TrackLoggerEvent {
    return {
      event,
      tags,
      url: window.location.href,
      title: document.title,
      ts: this.nowSeconds(),
    };
  }

  private sendLogsLoop(): void {
    if (this.retryTimer != null) {
      clearInterval(this.retryTimer);
    }

    this.retryTimer = window.setInterval(() => {
      this.sendLogs();
    }, SEND_LOGS_TIMEOUT);
  }

  private sheduleCollectBuffer(): void {
    if (this.collectBufferTimer != null) {
      clearTimeout(this.collectBufferTimer);
    }

    this.collectBufferTimer = window.setTimeout(() => {
      this.sendLogs();
    }, COLLECT_BUFFER_TIMEOUT);
  }

  private collectBuffer() {
    this.buffer.unshift(...this.unprocessedBuffer);
  }

  private async sendLogs(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const payload = this.buffer.splice(0, this.buffer.length);

    try {
      await TrackerRequest.sendEvents(payload);
    } catch {
      this.unprocessedBuffer.push(...payload);
      this.sheduleCollectBuffer();
    }
  }
}

export { TrackerLogger };
