import { TrackerLogger } from "./logger";
import { Tracker } from "./types";

declare global {
  interface Window {
    tracker: Tracker;
  }
}

(() => {
  const logger = new TrackerLogger();
  logger.init();

  window.tracker = logger;
})();
