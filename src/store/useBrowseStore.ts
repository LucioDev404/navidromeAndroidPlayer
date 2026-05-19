import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import type { Album, Artist, Playlist, Song } from "../api/models/media";
import {
  fetchAlbum,
  fetchArtist,
  fetchPlaylist,
} from "../api/subsonic/services/browseService";

interface AlbumCacheEntry {
  album: Album;
  songs: Song[];
}

interface ArtistCacheEntry {
  artist: Artist;
  albums: Album[];
}

interface PlaylistCacheEntry {
  playlist: Playlist;
  songs: Song[];
}

interface BrowseState {
  albumById: Record<string, AlbumCacheEntry>;
  artistById: Record<string, ArtistCacheEntry>;
  playlistById: Record<string, PlaylistCacheEntry>;
  loadingAlbumId: string | null;
  loadingArtistId: string | null;
  loadingPlaylistId: string | null;
  lastError: string | null;
  getAlbumEntry: (id: string) => AlbumCacheEntry | undefined;
  getArtistEntry: (id: string) => ArtistCacheEntry | undefined;
  getPlaylistEntry: (id: string) => PlaylistCacheEntry | undefined;
  loadAlbum: (
    id: string,
    options?: { force?: boolean },
  ) => Promise<AlbumCacheEntry | null>;
  loadArtist: (
    id: string,
    options?: { force?: boolean },
  ) => Promise<ArtistCacheEntry | null>;
  loadPlaylist: (
    id: string,
    options?: { force?: boolean },
  ) => Promise<PlaylistCacheEntry | null>;
  clear: () => void;
}

export const useBrowseStore = create<BrowseState>((set, get) => ({
  albumById: {},
  artistById: {},
  playlistById: {},
  loadingAlbumId: null,
  loadingArtistId: null,
  loadingPlaylistId: null,
  lastError: null,

  getAlbumEntry: (id) => get().albumById[id],

  getArtistEntry: (id) => get().artistById[id],

  getPlaylistEntry: (id) => get().playlistById[id],

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

  loadPlaylist: async (id, options) => {
    const cached = get().playlistById[id];
    if (cached && !options?.force) {
      return cached;
    }

    set({ loadingPlaylistId: id, lastError: null });

    try {
      const client = await useEndpointStore.getState().getActiveClient();
      if (!client) {
        throw new Error("No active server session.");
      }

      const result = await fetchPlaylist(client, id);
      if (!result) {
        throw new Error("Playlist not found.");
      }

      const entry: PlaylistCacheEntry = {
        playlist: result.playlist,
        songs: result.songs,
      };

      set((state) => ({
        playlistById: { ...state.playlistById, [id]: entry },
        loadingPlaylistId: null,
      }));

      return entry;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load playlist";
      set({ loadingPlaylistId: null, lastError: message });
      return null;
    }
  },

  clear: () =>
    set({
      albumById: {},
      artistById: {},
      playlistById: {},
      loadingAlbumId: null,
      loadingArtistId: null,
      loadingPlaylistId: null,
      lastError: null,
    }),
}));

export default useBrowseStore;
