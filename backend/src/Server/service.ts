import { Collection } from "mongodb";
import { TrackLoggerEvent } from "./types";
import path from "path";

class TrackService {
  private collection: Collection<TrackLoggerEvent> | null = null;

  setCollection(collection: Collection<TrackLoggerEvent>): void {
    this.collection = collection;
  }

  handleTrackRequest(body: unknown): number {
    const parsed = this.parseBody(body);

    if (!this.isTrackEventArray(parsed)) {
      return 422;
    }

    this.insertLogs(parsed);
    return 200;
  }

  handleTrackerScriptRequst() {
    return path.resolve(__dirname, "..", "Tracker", "tracker.js");
  }

  private parseBody(body: unknown): unknown {
    if (typeof body !== "string") {
      return null;
    }

    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  private isTrackEventArray(value: unknown): value is TrackLoggerEvent[] {
    if (!Array.isArray(value)) {
      return false;
    }

    for (const item of value) {
      if (!this.isTrackEvent(item)) {
        return false;
      }
    }

    return true;
  }

  private isTrackEvent(value: unknown): value is TrackLoggerEvent {
    if (!value || typeof value !== "object") {
      return false;
    }

    const v = value as Record<string, unknown>;
    return (
      typeof v.event === "string" &&
      this.isStringArray(v.tags) &&
      typeof v.url === "string" &&
      typeof v.title === "string" &&
      typeof v.ts === "number" &&
      Number.isFinite(v.ts)
    );
  }

  private isStringArray(value: unknown): value is string[] {
    if (!Array.isArray(value)) {
      return false;
    }

    for (const item of value) {
      if (typeof item !== "string") {
        return false;
      }
    }

    return true;
  }

  private insertLogs(events: TrackLoggerEvent[]): void {
    if (!this.collection) {
      console.error("Mongo collection not ready, dropping events");
      return;
    }

    this.collection.insertMany(events).catch((err) => {
      console.error("Failed to insert events", err);
    });
  }
}

export { TrackService };
