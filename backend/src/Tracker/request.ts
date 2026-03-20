import { TrackLoggerEvent } from "./types";

class TrackerRequest {
  private static readonly endpoint = "http://localhost:8888/track";

  static async sendEvents(events: TrackLoggerEvent[]): Promise<void> {
    const body = JSON.stringify(events);

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body,
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error("bad status");
    }
  }
}

export { TrackerRequest };
