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

export { TrackLoggerEvent, Tracker };
