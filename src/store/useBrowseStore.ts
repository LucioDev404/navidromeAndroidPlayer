import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import type { Album, Artist, Song } from "../api/models/media";
import {
  fetchAlbum,
  fetchArtist,
} from "../api/subsonic/services/browseService";

interface AlbumCacheEntry {
  album: Album;
  songs: Song[];
}

interface ArtistCacheEntry {
  artist: Artist;
  albums: Album[];
}

interface BrowseState {
  albumById: Record<string, AlbumCacheEntry>;
  artistById: Record<string, ArtistCacheEntry>;
  loadingAlbumId: string | null;
  loadingArtistId: string | null;
  lastError: string | null;
  getAlbumEntry: (id: string) => AlbumCacheEntry | undefined;
  getArtistEntry: (id: string) => ArtistCacheEntry | undefined;
  loadAlbum: (
    id: string,
    options?: { force?: boolean },
  ) => Promise<AlbumCacheEntry | null>;
  loadArtist: (
    id: string,
    options?: { force?: boolean },
  ) => Promise<ArtistCacheEntry | null>;
  clear: () => void;
}

export const useBrowseStore = create<BrowseState>((set, get) => ({
  albumById: {},
  artistById: {},
  loadingAlbumId: null,
  loadingArtistId: null,
  lastError: null,

  getAlbumEntry: (id) => get().albumById[id],

  getArtistEntry: (id) => get().artistById[id],

  loadAlbum: async (id, options) => {
    const cached = get().albumById[id];
    if (cached && !options?.force) {
      return cached;
    }

    set({ loadingAlbumId: id, lastError: null });

    try {
      const client = await useEndpointStore.getState().getActiveClient();
      if (!client) {
        throw new Error("No active server session.");
      }

      const result = await fetchAlbum(client, id);
      if (!result) {
        throw new Error("Album not found.");
      }

      const entry: AlbumCacheEntry = {
        album: result.album,
        songs: result.songs,
      };

      set((state) => ({
        albumById: { ...state.albumById, [id]: entry },
        loadingAlbumId: null,
      }));

      return entry;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load album";
      set({ loadingAlbumId: null, lastError: message });
      return null;
    }
  },

  loadArtist: async (id, options) => {
    const cached = get().artistById[id];
    if (cached && !options?.force) {
      return cached;
    }

    set({ loadingArtistId: id, lastError: null });

    try {
      const client = await useEndpointStore.getState().getActiveClient();
      if (!client) {
        throw new Error("No active server session.");
      }

      const result = await fetchArtist(client, id);
      if (!result) {
        throw new Error("Artist not found.");
      }

      const entry: ArtistCacheEntry = {
        artist: result.artist,
        albums: result.albums,
      };

      set((state) => ({
        artistById: { ...state.artistById, [id]: entry },
        loadingArtistId: null,
      }));

      return entry;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load artist";
      set({ loadingArtistId: null, lastError: message });
      return null;
    }
  },

  clear: () =>
    set({
      albumById: {},
      artistById: {},
      loadingAlbumId: null,
      loadingArtistId: null,
      lastError: null,
    }),
}));

export default useBrowseStore;
