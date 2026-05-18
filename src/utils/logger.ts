const PREFIX = "[NavidromePlayer]";

type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, details?: unknown) {
  if (!__DEV__ && level === "debug") {
    return;
  }

  const line = `${PREFIX} ${message}`;

  switch (level) {
    case "debug":
      console.debug(line, details ?? "");
      break;
    case "info":
      console.info(line, details ?? "");
      break;
    case "warn":
      console.warn(line, details ?? "");
      break;
    case "error":
      console.error(line, details ?? "");
      break;
  }
}

export const logger = {
  debug: (message: string, details?: unknown) => log("debug", message, details),
  info: (message: string, details?: unknown) => log("info", message, details),
  warn: (message: string, details?: unknown) => log("warn", message, details),
  error: (message: string, details?: unknown) => log("error", message, details),
};
