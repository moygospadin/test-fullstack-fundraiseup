import { BatchItem, TrackLoggerEvent } from "./types";

class TrackerRequest {
  private static readonly endpoint = "http://localhost:8888/track";

  static async sendEvents(
    events: BatchItem<TrackLoggerEvent>[],
  ): Promise<void> {
    const body = JSON.stringify(events.map((el) => el.message));

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body,
        keepalive: true,
      });
    } catch (error) {
      throw error;
    }
  }

  static sendEventsBeacon(events: BatchItem<TrackLoggerEvent>[]): void {
    if (typeof navigator === "undefined" || !navigator.sendBeacon) {
      return;
    }

    const body = JSON.stringify(events.map((el) => el.message));
    const payload = new Blob([body], {
      type: "text/plain;charset=UTF-8",
    });
    navigator.sendBeacon(this.endpoint, payload);
  }
}

export { TrackerRequest };
