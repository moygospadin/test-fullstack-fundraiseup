import express, { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";

import { TrackerController } from "./controller";
import { TrackService } from "./service";
import { TrackLoggerEvent } from "./types";

class TrackerServer {
  private readonly app = express();
  private readonly client: MongoClient;
  private readonly service = new TrackService();
  private readonly controller: TrackerController;

  constructor(
    private readonly mongoUrl: string,
    private readonly mongoDb: string,
  ) {
    this.client = new MongoClient(this.mongoUrl);
    this.controller = new TrackerController(this.service);
    this.configureMiddleware();
    this.controller.register(this.app);
  }

  start(port: number): void {
    this.connectMongo();
    this.app.listen(port, () => {
      console.log(`Tracker server listening on http://localhost:${port}`);
    });
  }

  private configureMiddleware(): void {
    this.app.use(this.handleCors.bind(this));
    this.app.use(express.text({ type: "*/*", limit: "1mb" }));
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

  private connectMongo(): void {
    this.client
      .connect()
      .then(() => {
        const collection = this.client
          .db(this.mongoDb)
          .collection<TrackLoggerEvent>("tracks");
        this.service.setCollection(collection);

        console.log("Mongo connected");
      })
      .catch((err) => {
        console.error("Mongo connection failed", err);
      });
  }
}

export { TrackerServer };
