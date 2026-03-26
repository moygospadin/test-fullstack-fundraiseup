enum HttpErrorCode {
  InvalidRequest = "invalid_request",
  MongoNotReady = "mongo_not_ready",
  MongoFailed = "mongo_failed",
  InternalError = "internal_error",
}

class HttpError extends Error {
  readonly code: HttpErrorCode;
  readonly status: number;
  readonly message: string;

  private constructor(code: HttpErrorCode, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.message = message;
  }

  static invalidRequest(message: string): HttpError {
    return new HttpError(HttpErrorCode.InvalidRequest, 422, message);
  }

  static mongoNotReady(message: string): HttpError {
    return new HttpError(HttpErrorCode.MongoNotReady, 503, message);
  }

  static mongoFailed(message: string): HttpError {
    return new HttpError(HttpErrorCode.MongoFailed, 500, message);
  }

  static internal(message: string): HttpError {
    return new HttpError(HttpErrorCode.InternalError, 500, message);
  }

  static fromUnknown(err: unknown, logPrefix: string): HttpError {
    if (err instanceof HttpError) {
      return err;
    }

    console.error(logPrefix, err);
    return HttpError.internal("Internal server error");
  }
}

export { HttpError, HttpErrorCode };
