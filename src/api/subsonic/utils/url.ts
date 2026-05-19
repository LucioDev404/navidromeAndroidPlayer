import { resolveAllowInsecure } from "../../../network/endpointPolicy";
import { SubsonicApiError } from "../models/errors";

export interface NormalizedServerUrl {
  origin: string;
  restBaseUrl: string;
  usesHttps: boolean;
}

export interface NormalizeServerUrlOptions {
  /**
   * When true, http:// URLs are accepted.
   * Use resolveAllowInsecure() + user opt-in — do not rely on __DEV__ alone.
   */
  allowInsecure?: boolean;
  /** Raw URL before normalization — used to infer policy when allowInsecure is omitted. */
  rawUrl?: string;
}

/**
 * Normalize Navidrome/Subsonic base URL.
 * Never auto-upgrades http:// to https://. Preserves user-entered protocol.
 */
export function normalizeServerUrl(
  rawUrl: string,
  options?: NormalizeServerUrlOptions,
): NormalizedServerUrl {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new SubsonicApiError("INVALID_URL", "Server URL is required.");
  }

  const allowInsecure =
    options?.allowInsecure ??
    resolveAllowInsecure(options?.rawUrl ?? trimmed, undefined);

  const hasExplicitProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  const defaultProtocol = allowInsecure ? "http:" : "https:";

  let parsed: URL;
  try {
    parsed = new URL(
      hasExplicitProtocol ? trimmed : `${defaultProtocol}//${trimmed}`,
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
      "HTTP is not allowed for this server. Enable “Allow HTTP (insecure)” or use https://.",
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
