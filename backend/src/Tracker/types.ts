import { promiseWithResolvers } from "./utils";

type TrackLoggerEvent = {
  event: string;
  tags: string[];
  url: string;
  title: string;
  ts: number;
};

interface Tracker {
  track(event: string, ...tags: string[]): void;
}

interface BatchManagerOptions {
  maxMessages: number;
  maxWaitTimeMilliseconds: number;
}

type BatchItem<T> = {
  message: T;
  deferred: ReturnType<typeof promiseWithResolvers<void>>;
};

export { TrackLoggerEvent, Tracker, BatchManagerOptions, BatchItem };
