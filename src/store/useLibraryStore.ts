import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import type { MediaLibrary } from "../api/models/media";
import {
  clearLibraryCache,
  readLibraryCache,
  writeLibraryCache,
} from "../api/subsonic/cache/libraryCache";
import { clearRequestCache } from "../api/subsonic/cache/requestCache";
import { fetchFullLibrary } from "../api/subsonic/services/libraryService";
import { safeLog } from "../security/safeLog";

interface LibraryState {
  isLoading: boolean;
  isHydrated: boolean;
  lastError: string | null;
  library: MediaLibrary;
  loadLibrary: (options?: { force?: boolean }) => Promise<void>;
  clear: () => void;
}

const EMPTY_LIBRARY: MediaLibrary = {
  artists: [],
  albums: [],
  songs: [],
  playlists: [],
  genres: [],
  recentlyAdded: [],
  randomAlbums: [],
  recentlyPlayed: [],
};

let loadPromise: Promise<void> | null = null;

export const useLibraryStore = create<LibraryState>((set, get) => ({
  isLoading: false,
  isHydrated: false,
  lastError: null,
  library: EMPTY_LIBRARY,

  loadLibrary: async (options) => {
    if (loadPromise && !options?.force) {
      return loadPromise;
    }

    loadPromise = (async () => {
      const endpoint = useEndpointStore.getState().getActiveEndpoint();
      if (!endpoint || !useEndpointStore.getState().isSessionAuthenticated) {
        set({
          lastError: "No active server session",
          isLoading: false,
          isHydrated: true,
        });
        return;
      }

      if (!options?.force) {
        const cached = await readLibraryCache(endpoint.id);
        if (cached) {
          set({
            library: cached,
            isHydrated: true,
            isLoading: false,
            lastError: null,
          });
          safeLog("info", "Library hydrated from cache");
        }
      }

      set({ isLoading: true, lastError: null });

      try {
        const client = await useEndpointStore.getState().getActiveClient();
        if (!client) {
          throw new Error("Unable to create API client for active session.");
        }

        const library = await fetchFullLibrary(client);
        await writeLibraryCache(endpoint.id, library);

        set({
          library,
          isLoading: false,
          isHydrated: true,
          lastError: null,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to load library";
        safeLog("error", "Library load failed", { error: errorMsg });

        const cached = await readLibraryCache(endpoint.id);
        set({
          lastError: cached ? `${errorMsg} — showing cached library` : errorMsg,
          library: cached ?? get().library,
          isLoading: false,
          isHydrated: true,
        });
      } finally {
        loadPromise = null;
      }
    })();

    return loadPromise;
  },

  clear: () => {
    clearRequestCache();
    clearLibraryCache().catch(() => {
      /* cache clear is best-effort on logout */
    });
    set({
      library: EMPTY_LIBRARY,
      lastError: null,
      isLoading: false,
      isHydrated: false,
    });
  },
}));

export default useLibraryStore;
