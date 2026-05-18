import AsyncStorage from "@react-native-async-storage/async-storage";

import type { MediaLibrary } from "../../../api/models/media";
import { safeLog } from "../../../security/safeLog";

const CACHE_PREFIX = "navidrome.library.cache.";
const CACHE_TTL_MS = 1000 * 60 * 15;

interface CachedLibraryPayload {
  savedAt: number;
  endpointId: string;
  data: MediaLibrary;
}

function cacheKey(endpointId: string): string {
  return `${CACHE_PREFIX}${endpointId}`;
}

export async function readLibraryCache(
  endpointId: string,
): Promise<MediaLibrary | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(endpointId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedLibraryPayload;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(cacheKey(endpointId));
      return null;
    }

    return parsed.data;
  } catch (error) {
    safeLog("warn", "Failed to read library cache", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function writeLibraryCache(
  endpointId: string,
  data: MediaLibrary,
): Promise<void> {
  try {
    const payload: CachedLibraryPayload = {
      savedAt: Date.now(),
      endpointId,
      data,
    };
    await AsyncStorage.setItem(cacheKey(endpointId), JSON.stringify(payload));
  } catch (error) {
    safeLog("warn", "Failed to write library cache", {
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function clearLibraryCache(endpointId?: string): Promise<void> {
  if (endpointId) {
    await AsyncStorage.removeItem(cacheKey(endpointId));
    return;
  }

  const keys = await AsyncStorage.getAllKeys();
  const libraryKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
  await AsyncStorage.multiRemove(libraryKeys);
}
