import { SubsonicApiError } from "../models/errors";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export async function withExponentialBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 400;
  const maxDelayMs = options.maxDelayMs ?? 4000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      const retryable =
        error instanceof SubsonicApiError
          ? error.retryable
          : error instanceof TypeError;

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = Math.min(
        maxDelayMs,
        baseDelayMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 100),
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
