import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import { useLibraryStore } from "./useLibraryStore";
import type {
  Album,
  Artist,
  Genre,
  Playlist,
  Song,
} from "../api/models/media";
import { SubsonicMappers } from "../api/mappers/subsonic";
import type { SubsonicClient } from "../api/subsonic/client/SubsonicClient";
import { fetchGenres, fetchPlaylists } from "../api/subsonic/services/libraryService";
import { searchLibrary } from "../api/subsonic/services/searchService";
import { safeLog } from "../security/safeLog";

interface SearchState {
  query: string;
  isSearching: boolean;
  lastError: string | null;
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  playlists: Playlist[];
  genres: Genre[];
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

let searchPromise: Promise<void> | null = null;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let extraResultsCache: { playlists: Playlist[]; genres: Genre[] } | null = null;

const normalizeSearch = (value: string) => value.trim().toLowerCase();
const matchesQuery = (candidate: string, query: string) =>
  candidate.toLowerCase().includes(query);

async function loadPlaylistAndGenreExtras(
  client: SubsonicClient,
): Promise<{ playlists: Playlist[]; genres: Genre[] }> {
  const library = useLibraryStore.getState();

  if (library.isHydrated && library.library.playlists.length > 0) {
    return {
      playlists: library.library.playlists,
      genres: library.library.genres,
    };
  }

  if (extraResultsCache) {
    return extraResultsCache;
  }

  const [playlistsRaw, genresRaw] = await Promise.all([
    fetchPlaylists(client),
    fetchGenres(client),
  ]);

  const result = {
    playlists: SubsonicMappers.mapPlaylists(client, playlistsRaw),
    genres: SubsonicMappers.mapGenres(genresRaw),
  };
  extraResultsCache = result;
  return result;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  isSearching: false,
  lastError: null,
  artists: [],
  albums: [],
  songs: [],
  playlists: [],
  genres: [],

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
        playlists: [],
        genres: [],
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
        playlists: [],
        genres: [],
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

        const [results, extras] = await Promise.all([
          searchLibrary(client, trimmed),
          loadPlaylistAndGenreExtras(client),
        ]);

        const normalized = normalizeSearch(trimmed);
        const playlistMatches = extras.playlists.filter((playlist) =>
          matchesQuery(playlist.name, normalized),
        );
        const genreMatches = extras.genres.filter((genre) =>
          matchesQuery(genre.name, normalized),
        );

        set({
          artists: results.artists,
          albums: results.albums,
          songs: results.songs,
          playlists: playlistMatches,
          genres: genreMatches,
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
          playlists: [],
          genres: [],
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
      playlists: [],
      genres: [],
      lastError: null,
      isSearching: false,
    });
  },
}));

export default useSearchStore;
