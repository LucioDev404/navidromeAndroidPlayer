import type {
  EndpointCredentials,
  NavidromeEndpoint,
} from "../api/subsonic/models/types";
import { safeLog } from "../security/safeLog";
import {
  readSecureJson,
  readSecureRaw,
  saveSecureJson,
  saveSecureRaw,
  deleteSecureItem,
  SECURE_STORAGE_KEYS,
} from "../security/secureStorage";

export async function loadEndpointRegistry(): Promise<NavidromeEndpoint[]> {
  const registry =
    (await readSecureJson<NavidromeEndpoint[]>(
      SECURE_STORAGE_KEYS.ENDPOINT_REGISTRY,
    )) ?? [];

  return registry.sort(
    (a, b) =>
      new Date(b.lastConnectedAt ?? b.createdAt).getTime() -
      new Date(a.lastConnectedAt ?? a.createdAt).getTime(),
  );
}

export async function saveEndpointRegistry(
  endpoints: NavidromeEndpoint[],
): Promise<void> {
  await saveSecureJson(SECURE_STORAGE_KEYS.ENDPOINT_REGISTRY, endpoints);
}

export async function loadActiveEndpointId(): Promise<string | null> {
  const fromJson = await readSecureJson<string>(
    SECURE_STORAGE_KEYS.ACTIVE_ENDPOINT_ID,
  );
  if (typeof fromJson === "string" && fromJson.length > 0) {
    return fromJson;
  }

  const raw = await readSecureRaw(SECURE_STORAGE_KEYS.ACTIVE_ENDPOINT_ID);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "string" ? parsed : raw;
  } catch {
    return raw;
  }
}

export async function saveActiveEndpointId(endpointId: string): Promise<void> {
  await saveSecureRaw(SECURE_STORAGE_KEYS.ACTIVE_ENDPOINT_ID, endpointId);
}

export async function clearActiveEndpointId(): Promise<void> {
  await deleteSecureItem(SECURE_STORAGE_KEYS.ACTIVE_ENDPOINT_ID);
}

export async function saveEndpointCredentials(
  endpointId: string,
  credentials: EndpointCredentials,
): Promise<void> {
  await saveSecureJson(SECURE_STORAGE_KEYS.credentialKey(endpointId), {
    username: credentials.username.trim(),
    password: credentials.password,
  });
}

export async function loadEndpointCredentials(
  endpointId: string,
): Promise<EndpointCredentials | null> {
  return readSecureJson<EndpointCredentials>(
    SECURE_STORAGE_KEYS.credentialKey(endpointId),
  );
}

export async function deleteEndpointCredentials(
  endpointId: string,
): Promise<void> {
  await deleteSecureItem(SECURE_STORAGE_KEYS.credentialKey(endpointId));
}

export async function upsertEndpoint(
  endpoint: NavidromeEndpoint,
  credentials: EndpointCredentials,
): Promise<NavidromeEndpoint[]> {
  const registry = await loadEndpointRegistry();
  const index = registry.findIndex((item) => item.id === endpoint.id);
  const next = [...registry];

  if (index >= 0) {
    next[index] = endpoint;
  } else {
    next.push(endpoint);
  }

  await saveEndpointRegistry(next);
  await saveEndpointCredentials(endpoint.id, credentials);

  safeLog("info", "Endpoint persisted", {
    endpointId: endpoint.id,
    label: endpoint.label,
    baseUrl: endpoint.baseUrl,
  });

  return next;
}

export async function removeEndpoint(
  endpointId: string,
): Promise<NavidromeEndpoint[]> {
  const registry = await loadEndpointRegistry();
  const next = registry.filter((item) => item.id !== endpointId);

  await saveEndpointRegistry(next);
  await deleteEndpointCredentials(endpointId);

  const activeId = await loadActiveEndpointId();
  if (activeId === endpointId) {
    await clearActiveEndpointId();
  }

  safeLog("info", "Endpoint removed", { endpointId });

  return next;
}
