import { TrackEventsParser } from "./trackEventsParser";
import { TrackRepository } from "./trackRepository";

class TrackService {
  constructor(
    private readonly parser: TrackEventsParser,
    private readonly repository: TrackRepository,
  ) {}

  async handleTrackRequest(body: unknown): Promise<void> {
    const parsed = this.parser.parse(body);
    await this.repository.insert(parsed);
  }
}

export { TrackService };
