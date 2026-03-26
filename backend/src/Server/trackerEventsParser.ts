import { TrackLoggerEvent } from "../Tracker/types";
import { HttpError } from "./httpError";

class TrackerEventsParser {
  parse(body: unknown): TrackLoggerEvent[] {
    const parsed = this.normalizeBody(body);
    if (!this.isTrackEventNotEmptyArray(parsed)) {
      throw HttpError.invalidRequest("Invalid track events payload");
    }

    return parsed.map((dirtyEvent) => this.buildEvent(dirtyEvent));
  }

  private normalizeBody(body: unknown): unknown {
    if (typeof body !== "string") {
      return body;
    }

    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  private isTrackEventNotEmptyArray(
    value: unknown,
  ): value is TrackLoggerEvent[] {
    if (!Array.isArray(value)) {
      return false;
    }

    if (value.length === 0) {
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

  private buildEvent(dirtyEvent: TrackLoggerEvent): TrackLoggerEvent {
    return {
      event: dirtyEvent.event,
      tags: dirtyEvent.tags,
      url: dirtyEvent.url,
      title: dirtyEvent.title,
      ts: dirtyEvent.ts,
    };
  }
}

export { TrackerEventsParser };
