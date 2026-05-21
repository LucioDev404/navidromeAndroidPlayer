import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import { useLibraryStore } from "./useLibraryStore";
import { SubsonicMappers } from "../api/mappers/subsonic";
import type { Album, Artist, Genre, Playlist, Song } from "../api/models/media";
import type { SubsonicClient } from "../api/subsonic/client/SubsonicClient";
import {
  fetchGenres,
  fetchPlaylists,
} from "../api/subsonic/services/libraryService";
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

const normalizeSearch = (value: string) => value.trim().toLowerCase();
const matchesQuery = (candidate: string, query: string) =>
  candidate.toLowerCase().includes(query);

export const useSearchStore = create<SearchState>((set) => {
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let currentSearchToken = 0;
  let extraResultsCache: { playlists: Playlist[]; genres: Genre[] } | null =
    null;

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

  async function executeSearch(query: string, searchToken: number) {
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

      if (searchToken !== currentSearchToken) {
        return;
      }

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
      if (searchToken !== currentSearchToken) {
        return;
      }

      const message = error instanceof Error ? error.message : "Search failed";
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
    }
  }

  return {
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
        currentSearchToken += 1;
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

      const requestToken = ++currentSearchToken;
      searchDebounceTimer = setTimeout(() => {
        executeSearch(query, requestToken).catch(() => {
          /* handled in executeSearch() */
        });
      }, 350);
    },

    search: async (query) => {
      const requestToken = ++currentSearchToken;
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
      }
      await executeSearch(query, requestToken);
    },

    clear: () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
      }
      currentSearchToken += 1;
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
  };
});

export default useSearchStore;
