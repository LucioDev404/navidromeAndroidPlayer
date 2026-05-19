/**
 * Endpoint URL policy for self-hosted Navidrome/Subsonic servers.
 * Supports HTTP, HTTPS, LAN IPs, custom ports, and explicit user opt-in.
 */

const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/;

function stripScheme(raw: string): string {
  return raw.replace(/^[a-z]+:\/\//i, "").split("/")[0] ?? "";
}

function extractHostname(raw: string): string {
  const hostPart = stripScheme(raw.trim());
  const withoutAuth = hostPart.split("@").pop() ?? hostPart;
  if (withoutAuth.startsWith("[")) {
    const end = withoutAuth.indexOf("]");
    return end >= 0 ? withoutAuth.slice(1, end) : withoutAuth;
  }
  return (withoutAuth.split(":")[0] ?? withoutAuth).toLowerCase();
}

export function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (!host) {
    return false;
  }
  if (host === "localhost" || host.endsWith(".local")) {
    return true;
  }
  if (PRIVATE_IPV4.test(host)) {
    return true;
  }
  if (host.includes(":")) {
    return true;
  }
  return false;
}

export function urlExplicitlyUsesHttp(rawUrl: string): boolean {
  return rawUrl.trim().toLowerCase().startsWith("http://");
}

export function urlExplicitlyUsesHttps(rawUrl: string): boolean {
  return rawUrl.trim().toLowerCase().startsWith("https://");
}

/**
 * Whether HTTP (cleartext) is permitted for this endpoint.
 * - User opt-in always wins when true.
 * - Explicit http:// in URL implies permission.
 * - LAN / localhost without scheme defaults to HTTP-friendly.
 */
export function resolveAllowInsecure(
  rawUrl: string,
  userOptIn?: boolean,
): boolean {
  if (userOptIn === true) {
    return true;
  }
  if (userOptIn === false) {
    return false;
  }

  if (urlExplicitlyUsesHttp(rawUrl)) {
    return true;
  }
  if (urlExplicitlyUsesHttps(rawUrl)) {
    return false;
  }

  const hostname = extractHostname(rawUrl);
  return isLocalOrPrivateHost(hostname);
}

export function defaultAllowInsecureOptIn(rawUrl: string): boolean {
  if (urlExplicitlyUsesHttps(rawUrl)) {
    return false;
  }
  return resolveAllowInsecure(rawUrl, true);
}

export function insecureConnectionWarning(rawUrl: string): string | null {
  if (urlExplicitlyUsesHttps(rawUrl)) {
    return null;
  }
  if (resolveAllowInsecure(rawUrl, true)) {
    return "HTTP sends credentials in cleartext. Use HTTPS on untrusted networks when possible.";
  }
  return null;
}
