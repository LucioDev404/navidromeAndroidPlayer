import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { safeLog } from "./safeLog";

/**
 * Web has no hardware-backed secure enclave. For persistence across page
 * reloads we use `localStorage` on web while clearly warning that this is
 * not as secure as native secure storage. Native platforms use
 * `expo-secure-store` which uses the OS-backed keychain/keystore.
 *
 * Security note: storing credentials in `localStorage` is a trade-off for
 * web compatibility (persist across refresh). Avoid storing long-lived
 * sensitive tokens there in production unless you control the server-side
 * security model. The app already logs a warning when secure storage is
 * unavailable.
 */
const webStorageAvailable =
  typeof window !== "undefined" && !!window.localStorage;

export const SECURE_STORAGE_KEYS = {
  ENDPOINT_REGISTRY: "navidrome.endpoint.registry",
  ACTIVE_ENDPOINT_ID: "navidrome.endpoint.active_id",
  credentialKey: (endpointId: string) =>
    `navidrome.endpoint.cred.${endpointId}`,
} as const;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (webStorageAvailable) {
      window.localStorage.setItem(key, value);
      return;
    }
    // fallback to in-memory when localStorage isn't available (rare)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__navidrome_web_vault =
      (globalThis as any).__navidrome_web_vault || new Map<string, string>();
    (globalThis as any).__navidrome_web_vault.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (webStorageAvailable) {
      return window.localStorage.getItem(key);
    }
    // fallback to in-memory when localStorage isn't available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vault = (globalThis as any).__navidrome_web_vault as
      | Map<string, string>
      | undefined;
    return vault?.get(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (webStorageAvailable) {
      window.localStorage.removeItem(key);
      return;
    }
    // fallback to in-memory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vault = (globalThis as any).__navidrome_web_vault as
      | Map<string, string>
      | undefined;
    vault?.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveSecureJson<T>(key: string, value: T): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

export async function readSecureJson<T>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    safeLog("error", "Failed to parse secure JSON payload", {
      key,
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  await deleteItem(key);
}

/** Plain string storage (used for active endpoint id — avoids JSON quoting issues). */
export async function saveSecureRaw(key: string, value: string): Promise<void> {
  await setItem(key, value);
}

export async function readSecureRaw(key: string): Promise<string | null> {
  return getItem(key);
}

export function isSecureStorageNative(): boolean {
  return Platform.OS !== "web";
}
