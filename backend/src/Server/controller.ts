import { Express, Request, Response } from "express";
import { TrackService } from "./service";
import { TrackerScriptService } from "./trackerScriptService";
import { AppResult } from "./appResult";

class TrackerController {
  constructor(
    private readonly service: TrackService,
    private readonly trackerScriptService: TrackerScriptService,
  ) {}

  register(app: Express): void {
    app.post("/track", this.handleTrack.bind(this));
    app.get("/tracker", this.handleTrackerScript.bind(this));
  }

  private async handleTrack(req: Request, res: Response): Promise<void> {
    try {
      await this.service.handleTrackRequest(req.body);
      res.sendStatus(200);
    } catch (err) {
      const result =
        err instanceof AppResult
          ? err
          : AppResult.internal("Internal server error");
      if (!(err instanceof AppResult)) {
        console.error("Unhandled error in track handler", err);
      }

      res.status(result.status).json({
        code: result.code,
        message: result.message,
      });
    }
  }

  private handleTrackerScript(_req: Request, res: Response): void {
    const trackerPath = this.trackerScriptService.getTrackerScriptPath();
    res.type("application/javascript");
    res.sendFile(trackerPath);
  }
}

export { TrackerController };
