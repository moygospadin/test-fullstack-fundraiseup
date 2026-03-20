import { TrackerLogger } from "./logger";
import { Tracker } from "./types";
(() => {
  const logger = new TrackerLogger();
  logger.init();

  const tracker: Tracker = {
    track: logger.track.bind(logger),
  };

  (window as any).tracker = tracker;
})();
