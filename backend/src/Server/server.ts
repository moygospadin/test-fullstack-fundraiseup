import express, { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { TrackerController } from "./controller";
import { TrackService } from "./service";
import { TrackLoggerEvent } from "../Tracker/types";
import { TrackEventsParser } from "./trackEventsParser";
import { TrackRepository } from "./trackRepository";
import { TrackerScriptService } from "./trackerScriptService";

class TrackerServer {
  private readonly app = express();
  private readonly client: MongoClient;
  private readonly repository = new TrackRepository();
  private readonly service = new TrackService(
    new TrackEventsParser(),
    this.repository,
  );
  private readonly trackerScriptService = new TrackerScriptService();
  private readonly controller: TrackerController;

  constructor(
    private readonly mongoUrl: string,
    private readonly mongoDb: string,
  ) {
    this.client = new MongoClient(this.mongoUrl);
    this.controller = new TrackerController(
      this.service,
      this.trackerScriptService,
    );
    this.configureMiddleware();
    this.controller.register(this.app);
  }

  async start(port: number): Promise<void> {
    await this.connectMongo();
    this.app.listen(port, () => {
      console.log(`Tracker server listening on http://localhost:${port}`);
    });
  }

  private configureMiddleware(): void {
    this.app.use(this.handleCors.bind(this));
    this.app.use(express.json({ limit: "1mb" }));
    this.app.use(express.text({ type: "text/plain", limit: "1mb" }));
  }

  private handleCors(req: Request, res: Response, next: NextFunction): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  }

  private async connectMongo(): Promise<void> {
    try {
      await this.client.connect();
      const collection = this.client
        .db(this.mongoDb)
        .collection<TrackLoggerEvent>("tracks");
      this.repository.setCollection(collection);

      console.log("Mongo connected");
    } catch (err) {
      console.error("Mongo connection failed", err);
      throw err;
    }
  }
}

export { TrackerServer };
