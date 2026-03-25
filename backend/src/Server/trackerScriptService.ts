import path from "path";

class TrackerScriptService {
  getTrackerScriptPath(): string {
    return (
      process.env.TRACKER_SCRIPT_PATH ??
      path.resolve(process.cwd(), "dist", "Tracker", "tracker.js")
    );
  }
}

export { TrackerScriptService };
