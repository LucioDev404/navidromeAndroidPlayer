import { pingEndpoint } from "./pingService";
import { resolveAllowInsecure } from "../../../network/endpointPolicy";
import { safeLog } from "../../../security/safeLog";
import { SubsonicClient } from "../client/SubsonicClient";
import { SubsonicApiError } from "../models/errors";
import type {
  CreateEndpointInput,
  EndpointCredentials,
  NavidromeEndpoint,
  SubsonicPingResult,
} from "../models/types";
import {
  sanitizeLabel,
  sanitizePassword,
  sanitizeUsername,
} from "../utils/sanitize";
import { normalizeServerUrl } from "../utils/url";

export interface ValidatedEndpointResult {
  endpoint: NavidromeEndpoint;
  ping: SubsonicPingResult;
}

function createEndpointId(): string {
  return `ep_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildEndpointFromInput(
  input: CreateEndpointInput,
  ping: SubsonicPingResult,
): NavidromeEndpoint {
  const allowInsecure = resolveAllowInsecure(
    input.baseUrl,
    input.allowInsecureConnection,
  );
  const normalized = normalizeServerUrl(input.baseUrl, {
    allowInsecure,
    rawUrl: input.baseUrl,
  });

  return {
    id: createEndpointId(),
    label: sanitizeLabel(input.label),
    baseUrl: normalized.origin,
    username: sanitizeUsername(input.username),
    allowInsecureConnection: allowInsecure || !normalized.usesHttps,
    createdAt: new Date().toISOString(),
    lastConnectedAt: new Date().toISOString(),
    connectionStatus: ping.status === "ok" ? "healthy" : "unhealthy",
  };
}

export async function validateAndTestEndpoint(
  input: CreateEndpointInput,
  signal?: AbortSignal,
): Promise<ValidatedEndpointResult> {
  const label = sanitizeLabel(input.label);
  const username = sanitizeUsername(input.username);
  const password = sanitizePassword(input.password);

  if (!label) {
    throw new SubsonicApiError("INVALID_URL", "Endpoint label is required.");
  }

  if (!username) {
    throw new SubsonicApiError("INVALID_CREDENTIALS", "Username is required.");
  }

  if (!password) {
    throw new SubsonicApiError("INVALID_CREDENTIALS", "Password is required.");
  }

  const allowInsecure = resolveAllowInsecure(
    input.baseUrl,
    input.allowInsecureConnection,
  );
  const normalized = normalizeServerUrl(input.baseUrl, {
    allowInsecure,
    rawUrl: input.baseUrl,
  });
  const credentials: EndpointCredentials = { username, password };

  safeLog("info", "Validating Navidrome endpoint", {
    label,
    baseUrl: normalized.origin,
    username,
    usesHttps: normalized.usesHttps,
    allowInsecure,
  });

  const ping = await pingEndpoint(normalized.restBaseUrl, credentials, signal, {
    allowInsecure,
  });

  if (ping.status !== "ok") {
    throw new SubsonicApiError(
      "UNSUPPORTED_API",
      "Server did not return a successful Subsonic ping response.",
    );
  }

  const endpoint = buildEndpointFromInput(
    {
      label,
      baseUrl: input.baseUrl,
      username,
      password,
      allowInsecureConnection: allowInsecure,
    },
    ping,
  );

  return { endpoint, ping };
}

export async function testExistingEndpoint(
  endpoint: NavidromeEndpoint,
  credentials: EndpointCredentials,
  signal?: AbortSignal,
): Promise<SubsonicPingResult> {
  const allowInsecure =
    endpoint.allowInsecureConnection ??
    resolveAllowInsecure(endpoint.baseUrl, undefined);

  const client = new SubsonicClient({
    baseUrl: endpoint.baseUrl,
    credentials,
    allowInsecure,
  });

  return client.ping(signal);
}
