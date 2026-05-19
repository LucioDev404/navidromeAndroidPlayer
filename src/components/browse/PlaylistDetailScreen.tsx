import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TrackRow } from "./TrackRow";
import type { Song } from "../../api/models/media";
import { getScrollBottomInset } from "../../navigation/layoutMetrics";
import {
  useActiveQueueIndex,
  useIsPlaylistQueue,
  usePlayerActions,
  usePlayerQueue,
} from "../../store/playerSelectors";
import { useBrowseStore } from "../../store/useBrowseStore";
import { authColors, authSpacing } from "../../theme/authTheme";
import { AuthGradientBackground } from "../auth/AuthGradientBackground";
import { CachedCover } from "../ui/CachedCover";

interface PlaylistDetailScreenProps {
  playlistId: string;
}

const TRACK_ROW_HEIGHT = 52;

export function PlaylistDetailScreen({
  playlistId,
}: PlaylistDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadPlaylist = useBrowseStore((s) => s.loadPlaylist);
  const entry = useBrowseStore((s) => s.playlistById[playlistId]);
  const isLoading = useBrowseStore((s) => s.loadingPlaylistId === playlistId);
  const lastError = useBrowseStore((s) => s.lastError);
  const { playQueue, playQueueIndex } = usePlayerActions();
  const activeIndex = useActiveQueueIndex();
  const playerQueue = usePlayerQueue();
  const isThisPlaylistQueue = useIsPlaylistQueue(playlistId);

  useEffect(() => {
    loadPlaylist(playlistId).catch(() => undefined);
  }, [loadPlaylist, playlistId]);

  const songs = useMemo(() => entry?.songs ?? [], [entry?.songs]);
  const playlist = entry?.playlist;

  const queueForPlayback = useMemo(() => {
    if (isThisPlaylistQueue && playerQueue.length === songs.length) {
      return playerQueue;
    }
    return songs;
  }, [isThisPlaylistQueue, playerQueue, songs]);

  const playlistContext = useMemo(
    () =>
      playlist
        ? {
            type: "playlist" as const,
            id: playlistId,
            title: playlist.name,
          }
        : null,
    [playlist, playlistId],
  );

  const handlePlayAll = useCallback(() => {
    if (songs.length > 0) {
      playQueue(songs, 0, playlistContext);
    }
  }, [playQueue, playlistContext, songs]);

  const handleShuffle = useCallback(() => {
    if (songs.length === 0) {
      return;
    }
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playQueue(shuffled, 0, playlistContext);
  }, [playQueue, playlistContext, songs]);

  const handleTrackPress = useCallback(
    (index: number) => {
      if (isThisPlaylistQueue) {
        playQueueIndex(index);
        return;
      }
      playQueue(songs, index, playlistContext);
    },
    [isThisPlaylistQueue, playQueue, playQueueIndex, playlistContext, songs],
  );

  const renderTrack = useCallback(
    ({ item, index }: { item: Song; index: number }) => {
      const isActive = isThisPlaylistQueue && index === activeIndex;
      return (
        <TrackRow
          song={item}
          index={index}
          isActive={isActive}
          onPress={() => handleTrackPress(index)}
        />
      );
    },
    [activeIndex, handleTrackPress, isThisPlaylistQueue],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.hero}>
        {playlist ? (
          <>
            <CachedCover
              uri={playlist.coverArtUrl}
              size={220}
              borderRadius={12}
              style={styles.cover}
            />
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            <Text style={styles.meta}>
              {songs.length} songs
              {isThisPlaylistQueue ? " · playing from this playlist" : ""}
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.playAll} onPress={handlePlayAll}>
                <Ionicons name="play" size={20} color="#000" />
                <Text style={styles.playAllLabel}>Play</Text>
              </Pressable>
              <Pressable style={styles.shuffle} onPress={handleShuffle}>
                <Ionicons
                  name="shuffle"
                  size={20}
                  color={authColors.textPrimary}
                />
                <Text style={styles.shuffleLabel}>Shuffle</Text>
              </Pressable>
            </View>
            <Text style={styles.queueHeading}>Track list</Text>
          </>
        ) : null}
        {isLoading ? (
          <ActivityIndicator color={authColors.accent} style={styles.loader} />
        ) : null}
        {lastError && !playlist ? (
          <Text style={styles.error}>{lastError}</Text>
        ) : null}
      </View>
    ),
    [
      handlePlayAll,
      handleShuffle,
      isLoading,
      isThisPlaylistQueue,
      lastError,
      playlist,
      songs.length,
    ],
  );

  const bottomPadding = getScrollBottomInset(insets.bottom, {
    hasMiniPlayer: true,
    showTabBar: false,
  });

  return (
    <AuthGradientBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={authColors.textPrimary}
          />
        </Pressable>

        <FlatList
          data={isThisPlaylistQueue ? queueForPlayback : songs}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={24}
          windowSize={10}
          getItemLayout={(_, index) => ({
            length: TRACK_ROW_HEIGHT,
            offset: TRACK_ROW_HEIGHT * index,
            index,
          })}
          ListEmptyComponent={
            !isLoading && playlist ? (
              <Text style={styles.emptyTracks}>
                No tracks in this playlist.
              </Text>
            ) : null
          }
          extraData={`${activeIndex}-${isThisPlaylistQueue}`}
        />
      </View>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  back: {
    paddingHorizontal: authSpacing.lg,
    paddingVertical: authSpacing.sm,
  },
  hero: {
    paddingHorizontal: authSpacing.lg,
    paddingBottom: authSpacing.sm,
  },
  cover: {
    alignSelf: "center",
    marginBottom: authSpacing.md,
  },
  playlistTitle: {
    color: authColors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  meta: {
    color: authColors.textMuted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: authSpacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: authSpacing.md,
    marginBottom: authSpacing.md,
  },
  playAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: authColors.accent,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  playAllLabel: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
  shuffle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: authColors.surfaceHighlight,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  shuffleLabel: {
    color: authColors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  queueHeading: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  loader: {
    marginVertical: authSpacing.lg,
  },
  error: {
    color: authColors.danger,
    textAlign: "center",
    marginTop: authSpacing.md,
  },
  emptyTracks: {
    color: authColors.textSecondary,
    textAlign: "center",
    padding: authSpacing.lg,
  },
});
