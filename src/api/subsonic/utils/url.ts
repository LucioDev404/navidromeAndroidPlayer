import { SubsonicApiError } from "../models/errors";

export interface NormalizedServerUrl {
  origin: string;
  restBaseUrl: string;
  usesHttps: boolean;
}

export function normalizeServerUrl(rawUrl: string): NormalizedServerUrl {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new SubsonicApiError("INVALID_URL", "Server URL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new SubsonicApiError(
      "INVALID_URL",
      "Server URL is malformed. Example: https://music.example.com",
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new SubsonicApiError(
      "INVALID_URL",
      "Only HTTP and HTTPS URLs are supported.",
    );
  }

  const usesHttps = parsed.protocol === "https:";

  if (!usesHttps && !__DEV__) {
    throw new SubsonicApiError(
      "INSECURE_URL",
      "HTTPS is required for production. Use an https:// server URL.",
    );
  }

  const origin = parsed.origin;
  const pathname = parsed.pathname.replace(/\/+$/, "");
  const restBaseUrl = pathname.endsWith("/rest")
    ? `${origin}${pathname}`
    : `${origin}${pathname}/rest`;

  return {
    origin,
    restBaseUrl,
    usesHttps,
  };
}

export function buildSubsonicRequestUrl(
  restBaseUrl: string,
  endpointPath: string,
  queryParams: Record<string, string>,
): string {
  const base = restBaseUrl.replace(/\/+$/, "");
  const path = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
  const url = new URL(`${base}${path}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function redactUrlForLogs(url: string): string {
  try {
    const parsed = new URL(url);
    ["p", "t", "password", "token"].forEach((key) => {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, "[REDACTED]");
      }
    });
    return parsed.toString();
  } catch {
    return "[invalid-url]";
  }
}
