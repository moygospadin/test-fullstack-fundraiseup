import { Server } from "./Server/server";
const MONGO_URL = process.env.MONGO_URL ?? "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGO_DB ?? "tracker";

const server = new Server(MONGO_URL, MONGO_DB);
server.start(8888).catch((err) => {
  console.error("Failed to start tracker server", err);
  process.exit(1);
});
