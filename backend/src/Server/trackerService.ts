import { TrackerEventsParser } from "./trackerEventsParser";
import { TrackerRepository } from "./trackerRepository";

class TrackerService {
  constructor(
    private readonly parser: TrackerEventsParser,
    private readonly repository: TrackerRepository,
  ) {}

  async handleTrackRequest(body: unknown): Promise<void> {
    const parsed = this.parser.parse(body);
    await this.repository.insert(parsed);
  }
}

export { TrackerService };
