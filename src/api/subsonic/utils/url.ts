import { SubsonicApiError } from "../models/errors";

export interface NormalizedServerUrl {
  origin: string;
  restBaseUrl: string;
  usesHttps: boolean;
}

export interface NormalizeServerUrlOptions {
  /** When true, HTTP URLs are allowed (required for LAN/self-hosted). Defaults to __DEV__. */
  allowInsecure?: boolean;
}

/**
 * Normalize Navidrome/Subsonic base URL.
 * In development, HTTP is allowed by default for self-hosted servers.
 */
export function normalizeServerUrl(
  rawUrl: string,
  options?: NormalizeServerUrlOptions,
): NormalizedServerUrl {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new SubsonicApiError("INVALID_URL", "Server URL is required.");
  }

  const allowInsecure = options?.allowInsecure ?? __DEV__;
  const defaultProtocol = allowInsecure ? "http:" : "https:";

  let parsed: URL;
  try {
    parsed = new URL(
      trimmed.includes("://") ? trimmed : `${defaultProtocol}//${trimmed}`,
    );
  } catch {
    throw new SubsonicApiError(
      "INVALID_URL",
      "Server URL is malformed. Example: http://192.168.1.10:4533",
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new SubsonicApiError(
      "INVALID_URL",
      "Only HTTP and HTTPS URLs are supported.",
    );
  }

  const usesHttps = parsed.protocol === "https:";

  if (!usesHttps && !allowInsecure) {
    throw new SubsonicApiError(
      "INSECURE_URL",
      "HTTP is not allowed for this server. Enable “Allow HTTP” or use https://.",
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
