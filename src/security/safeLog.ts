const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|credential|salt|api[_-]?key/i;

const URL_CREDENTIAL_PATTERN = /([?&])(p|t|password|token)=([^&]+)/gi;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return "[REDACTED]";
  }

  if (typeof value === "string") {
    return value.replace(URL_CREDENTIAL_PATTERN, "$1$2=[REDACTED]");
  }

  return value;
}

function redactObject(input: unknown, depth = 0): unknown {
  if (depth > 6) {
    return "[TRUNCATED]";
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactObject(item, depth + 1));
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([key, value]) => [
        key,
        redactObject(redactValue(key, value), depth + 1),
      ]),
    );
  }

  if (typeof input === "string") {
    return String(redactValue("url", input));
  }

  return input;
}

export function safeLog(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  details?: unknown,
) {
  if (!__DEV__ && level === "debug") {
    return;
  }

  const line = `[NavidromePlayer] ${message}`;
  const payload = details === undefined ? "" : redactObject(details);

  switch (level) {
    case "debug":
      console.debug(line, payload);
      break;
    case "info":
      console.info(line, payload);
      break;
    case "warn":
      console.warn(line, payload);
      break;
    case "error":
      console.error(line, payload);
      break;
  }
}
