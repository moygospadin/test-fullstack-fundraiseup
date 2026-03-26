import { Collection } from "mongodb";
import { TrackLoggerEvent } from "../Tracker/types";
import { HttpError } from "./httpError";

class TrackRepository {
  private collection: Collection<TrackLoggerEvent> | null = null;

  setCollection(collection: Collection<TrackLoggerEvent>): void {
    this.collection = collection;
  }

  async insert(events: TrackLoggerEvent[]): Promise<void> {
    if (!this.collection) {
      throw HttpError.mongoNotReady("Mongo collection not ready");
    }

    try {
      await this.collection.insertMany(events);
    } catch (err) {
      console.error("Failed to insert events", err);
      throw HttpError.mongoFailed("Failed to insert events");
    }
  }
}

export { TrackRepository };
