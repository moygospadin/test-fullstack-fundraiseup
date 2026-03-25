import { Collection } from "mongodb";
import { TrackLoggerEvent } from "../Tracker/types";
import { AppResult } from "./appResult";

class TrackRepository {
  private collection: Collection<TrackLoggerEvent> | null = null;

  setCollection(collection: Collection<TrackLoggerEvent>): void {
    this.collection = collection;
  }

  async insert(events: TrackLoggerEvent[]): Promise<void> {
    if (!this.collection) {
      throw AppResult.mongoNotReady("Mongo collection not ready");
    }

    try {
      await this.collection.insertMany(events);
    } catch (err) {
      console.error("Failed to insert events", err);
      throw AppResult.mongoFailed("Failed to insert events");
    }
  }
}

export { TrackRepository };
