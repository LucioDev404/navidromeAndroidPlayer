import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import type { Album, Artist, Song } from "../api/models/media";
import { searchLibrary } from "../api/subsonic/services/searchService";
import { safeLog } from "../security/safeLog";

interface SearchState {
  query: string;
  isSearching: boolean;
  lastError: string | null;
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

let searchPromise: Promise<void> | null = null;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  isSearching: false,
  lastError: null,
  artists: [],
  albums: [],
  songs: [],

  setQuery: (query) => {
    set({ query });

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (!query.trim()) {
      set({
        artists: [],
        albums: [],
        songs: [],
        lastError: null,
        isSearching: false,
      });
      return;
    }

    searchDebounceTimer = setTimeout(() => {
      get()
        .search(query)
        .catch(() => {
          /* handled in search() */
        });
    }, 350);
  },

  search: async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set({
        artists: [],
        albums: [],
        songs: [],
        isSearching: false,
        lastError: null,
      });
      return;
    }

    if (searchPromise) {
      await searchPromise;
    }

    searchPromise = (async () => {
      set({ isSearching: true, lastError: null });

      try {
        const client = await useEndpointStore.getState().getActiveClient();
        if (!client) {
          throw new Error("Sign in to a server before searching.");
        }

        const results = await searchLibrary(client, trimmed);
        set({
          artists: results.artists,
          albums: results.albums,
          songs: results.songs,
          isSearching: false,
          lastError: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Search failed";
        safeLog("warn", "Search failed", { error: message });
        set({
          isSearching: false,
          lastError: message,
          artists: [],
          albums: [],
          songs: [],
        });
      } finally {
        searchPromise = null;
      }
    })();

    await searchPromise;
  },

  clear: () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    set({
      query: "",
      artists: [],
      albums: [],
      songs: [],
      lastError: null,
      isSearching: false,
    });
  },
}));

export default useSearchStore;
