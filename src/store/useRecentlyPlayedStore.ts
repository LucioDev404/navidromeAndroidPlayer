import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import type { Song } from "../api/models/media";
import { PlaybackEvents } from "../services/audio/PlaybackEvents";

const MAX_ENTRIES = 40;
const STORAGE_PREFIX = "@navidrome/recently_played/";

export interface RecentlyPlayedEntry {
  song: Song;
  playedAt: string;
}

interface RecentlyPlayedState {
  entries: RecentlyPlayedEntry[];
  isHydrated: boolean;
  hydrate: (endpointId: string) => Promise<void>;
  clear: () => void;
}

function storageKey(endpointId: string): string {
  return `${STORAGE_PREFIX}${endpointId}`;
}

function dedupePrepend(
  entries: RecentlyPlayedEntry[],
  song: Song,
): RecentlyPlayedEntry[] {
  const playedAt = new Date().toISOString();
  const next = [
    { song, playedAt },
    ...entries.filter((entry) => entry.song.id !== song.id),
  ];
  return next.slice(0, MAX_ENTRIES);
}

export const useRecentlyPlayedStore = create<RecentlyPlayedState>((set) => ({
  entries: [],
  isHydrated: false,

  hydrate: async (endpointId) => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(endpointId));
      const parsed = raw ? (JSON.parse(raw) as RecentlyPlayedEntry[]) : [];
      set({ entries: Array.isArray(parsed) ? parsed : [], isHydrated: true });
    } catch {
      set({ entries: [], isHydrated: true });
    }
  },

  clear: () => {
    set({ entries: [], isHydrated: false });
  },
}));

async function persistEntries(
  endpointId: string,
  entries: RecentlyPlayedEntry[],
) {
  await AsyncStorage.setItem(storageKey(endpointId), JSON.stringify(entries));
}

function recordPlayback(song: Song): void {
  const endpointId = useEndpointStore.getState().activeEndpointId;
  if (!endpointId) {
    return;
  }

  const next = dedupePrepend(useRecentlyPlayedStore.getState().entries, song);
  useRecentlyPlayedStore.setState({ entries: next, isHydrated: true });
  persistEntries(endpointId, next).catch(() => undefined);
}

let unsubscribePlayback: (() => void) | null = null;

export function bindRecentlyPlayedToPlayback(): () => void {
  if (unsubscribePlayback) {
    return unsubscribePlayback;
  }

  unsubscribePlayback = PlaybackEvents.onTrackStarted((song) => {
    recordPlayback(song);
  });

  return unsubscribePlayback;
}

export function selectRecentlyPlayedSongs(): Song[] {
  return useRecentlyPlayedStore.getState().entries.map((entry) => entry.song);
}
