import { logger } from "../utils/logger";

export function setupGlobalErrorHandlers() {
  const errorUtils = (
    global as typeof globalThis & {
      ErrorUtils?: {
        getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
        setGlobalHandler: (
          handler: (error: Error, isFatal?: boolean) => void,
        ) => void;
      };
    }
  ).ErrorUtils;

  if (!errorUtils) {
    return;
  }

  const defaultHandler = errorUtils.getGlobalHandler();

  errorUtils.setGlobalHandler((error, isFatal) => {
    logger.error("Uncaught global error", {
      message: error.message,
      stack: error.stack,
      isFatal,
    });
    defaultHandler(error, isFatal);
  });
}
