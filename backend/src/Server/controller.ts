import { Express, Request, Response } from "express";
import { TrackerService } from "./trackerService";
import { TrackerScriptService } from "./trackerScriptService";
import { HttpError } from "./httpError";

class Controller {
  constructor(
    private readonly service: TrackerService,
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
      const result = HttpError.fromUnknown(
        err,
        "Unhandled error in track handler",
      );

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

export { Controller };
