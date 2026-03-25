import { Collection } from "mongodb";
import { TrackLoggerEvent } from "../Tracker/types";

enum TrackInsertResult {
  Ok = "ok",
  NotReady = "not_ready",
  Failed = "failed",
}

class TrackResult extends Error {
  readonly result: TrackInsertResult;
  readonly status: number;

  constructor(result: TrackInsertResult, status: number, message: string) {
    super(message);
    this.result = result;
    this.status = status;
  }
}

class TrackRepository {
  private collection: Collection<TrackLoggerEvent> | null = null;

  setCollection(collection: Collection<TrackLoggerEvent>): void {
    this.collection = collection;
  }

  async insert(events: TrackLoggerEvent[]): Promise<TrackResult> {
    if (!this.collection) {
      return new TrackResult(
        TrackInsertResult.NotReady,
        503,
        "Mongo collection not ready",
      );
    }

    try {
      await this.collection.insertMany(events);
      return new TrackResult(TrackInsertResult.Ok, 200, "OK");
    } catch (err) {
      console.error("Failed to insert events", err);
      return new TrackResult(
        TrackInsertResult.Failed,
        500,
        "Failed to insert events",
      );
    }
  }
}

export { TrackRepository, TrackResult, TrackInsertResult };
