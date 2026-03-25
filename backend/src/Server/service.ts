import { TrackEventsParser, TrackRequestError } from "./trackEventsParser";
import { TrackRepository, TrackResult } from "./trackRepository";

class TrackService {
  constructor(
    private readonly parser: TrackEventsParser,
    private readonly repository: TrackRepository,
  ) {}

  async handleTrackRequest(
    body: unknown,
  ): Promise<TrackRequestError | TrackResult> {
    const parsed = this.parser.parse(body);
    if (parsed instanceof TrackRequestError) {
      return parsed;
    }

    return this.repository.insert(parsed);
  }
}

export { TrackService };
