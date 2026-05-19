import { logger } from "./logger";

export interface SafeAsyncOptions<T> {
  fallback?: T;
  logLabel?: string;
  onError?: (error: unknown) => void;
}

/**
 * Wraps async work so callers never leave unhandled rejections.
 */
export async function safeAsync<T>(
  work: () => Promise<T>,
  options: SafeAsyncOptions<T> = {},
): Promise<T | undefined> {
  try {
    return await work();
  } catch (error) {
    if (options.logLabel) {
      logger.error(options.logLabel, error);
    }
    options.onError?.(error);
    return options.fallback;
  }
}

export function safeAsyncVoid(
  work: () => Promise<void>,
  options: Omit<SafeAsyncOptions<void>, "fallback"> = {},
): void {
  work().catch((error) => {
    if (options.logLabel) {
      logger.error(options.logLabel, error);
    }
    options.onError?.(error);
  });
}
