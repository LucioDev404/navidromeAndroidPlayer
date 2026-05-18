export type SubsonicErrorCode =
  | "INVALID_URL"
  | "INSECURE_URL"
  | "INVALID_CREDENTIALS"
  | "SERVER_UNREACHABLE"
  | "TIMEOUT"
  | "SSL_ERROR"
  | "UNSUPPORTED_API"
  | "MALFORMED_RESPONSE"
  | "OFFLINE"
  | "CANCELLED"
  | "UNKNOWN";

export class SubsonicApiError extends Error {
  readonly code: SubsonicErrorCode;
  readonly retryable: boolean;
  readonly statusCode?: number;

  constructor(
    code: SubsonicErrorCode,
    message: string,
    options?: { retryable?: boolean; statusCode?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "SubsonicApiError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.statusCode = options?.statusCode;

    if (options?.cause instanceof Error) {
      this.cause = options.cause;
    }
  }
}

export function isSubsonicApiError(error: unknown): error is SubsonicApiError {
  return error instanceof SubsonicApiError;
}
