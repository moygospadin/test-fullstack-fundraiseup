import { Express, Request, Response } from "express";
import { TrackService } from "./service";

class TrackerController {
  constructor(private readonly service: TrackService) {}

  register(app: Express): void {
    app.post("/track", this.handleTrack.bind(this));
    app.get("/tracker", this.handleTrackerScript.bind(this));
  }

  private handleTrack(req: Request, res: Response): void {
    const status = this.service.handleTrackRequest(req.body);
    res.sendStatus(status);
  }

  private handleTrackerScript(_req: Request, res: Response): void {
    const trackerPath = this.service.handleTrackerScriptRequst();
    res.type("application/javascript");
    res.sendFile(trackerPath);
  }
}

export { TrackerController };
