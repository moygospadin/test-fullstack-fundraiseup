enum AppResultCode {
  Ok = "ok",
  InvalidRequest = "invalid_request",
  MongoNotReady = "mongo_not_ready",
  MongoFailed = "mongo_failed",
  InternalError = "internal_error",
}

class AppResult extends Error {
  readonly code: AppResultCode;
  readonly status: number;
  readonly message: string;

  private constructor(code: AppResultCode, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.message = message;
  }

  get ok(): boolean {
    return this.code === AppResultCode.Ok;
  }

  static invalidRequest(message: string): AppResult {
    return new AppResult(AppResultCode.InvalidRequest, 422, message);
  }

  static mongoNotReady(message: string): AppResult {
    return new AppResult(AppResultCode.MongoNotReady, 503, message);
  }

  static mongoFailed(message: string): AppResult {
    return new AppResult(AppResultCode.MongoFailed, 500, message);
  }

  static internal(message: string): AppResult {
    return new AppResult(AppResultCode.InternalError, 500, message);
  }
}

export { AppResult, AppResultCode };
