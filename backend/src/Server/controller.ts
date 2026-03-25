import { Express, Request, Response } from "express";
import { TrackService } from "./service";
import { TrackerScriptService } from "./trackerScriptService";

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
    const error = await this.service.handleTrackRequest(req.body);
    res.sendStatus(error.status);
  }

  private handleTrackerScript(_req: Request, res: Response): void {
    const trackerPath = this.trackerScriptService.getTrackerScriptPath();
    res.type("application/javascript");
    res.sendFile(trackerPath);
  }
}

export { TrackerController };
