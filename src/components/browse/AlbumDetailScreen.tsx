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
import { openArtist } from "../../navigation/navigationHelpers";
import {
  useActiveQueueIndex,
  useIsAlbumQueue,
  usePlayerActions,
  usePlayerQueue,
} from "../../store/playerSelectors";
import { useBrowseStore } from "../../store/useBrowseStore";
import { authColors, authSpacing } from "../../theme/authTheme";
import { AuthGradientBackground } from "../auth/AuthGradientBackground";
import { CachedCover } from "../ui/CachedCover";

interface AlbumDetailScreenProps {
  albumId: string;
}

const TRACK_ROW_HEIGHT = 52;

export function AlbumDetailScreen({ albumId }: AlbumDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadAlbum = useBrowseStore((s) => s.loadAlbum);
  const entry = useBrowseStore((s) => s.albumById[albumId]);
  const isLoading = useBrowseStore((s) => s.loadingAlbumId === albumId);
  const lastError = useBrowseStore((s) => s.lastError);
  const { playQueue, playQueueIndex } = usePlayerActions();
  const activeIndex = useActiveQueueIndex();
  const playerQueue = usePlayerQueue();
  const isThisAlbumQueue = useIsAlbumQueue(albumId);

  useEffect(() => {
    loadAlbum(albumId).catch(() => undefined);
  }, [albumId, loadAlbum]);

  const songs = useMemo(() => entry?.songs ?? [], [entry?.songs]);
  const album = entry?.album;

  const queueForPlayback = useMemo(() => {
    if (isThisAlbumQueue && playerQueue.length === songs.length) {
      return playerQueue;
    }
    return songs;
  }, [isThisAlbumQueue, playerQueue, songs]);

  const albumContext = useMemo(
    () =>
      album
        ? {
            type: "album" as const,
            id: albumId,
            title: album.title,
          }
        : null,
    [album, albumId],
  );

  const handlePlayAll = useCallback(() => {
    if (songs.length > 0) {
      playQueue(songs, 0, albumContext);
    }
  }, [albumContext, playQueue, songs]);

  const handleShuffle = useCallback(() => {
    if (songs.length === 0) {
      return;
    }
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playQueue(shuffled, 0, albumContext);
  }, [albumContext, playQueue, songs]);

  const handleTrackPress = useCallback(
    (index: number) => {
      if (isThisAlbumQueue) {
        playQueueIndex(index);
        return;
      }
      playQueue(songs, index, albumContext);
    },
    [albumContext, isThisAlbumQueue, playQueue, playQueueIndex, songs],
  );

  const renderTrack = useCallback(
    ({ item, index }: { item: Song; index: number }) => {
      const isActive = isThisAlbumQueue && index === activeIndex;
      return (
        <TrackRow
          song={item}
          index={index}
          isActive={isActive}
          onPress={() => handleTrackPress(index)}
        />
      );
    },
    [activeIndex, handleTrackPress, isThisAlbumQueue],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.hero}>
        {album ? (
          <>
            <CachedCover
              uri={album.coverArtUrl}
              size={220}
              borderRadius={12}
              style={styles.cover}
            />
            <Text style={styles.albumTitle}>{album.title}</Text>
            <Pressable
              onPress={() => {
                if (album.artistId) {
                  openArtist(router, album.artistId);
                }
              }}
            >
              <Text style={styles.albumArtist}>{album.artist}</Text>
            </Pressable>
            <Text style={styles.meta}>
              {album.year ? `${album.year} · ` : ""}
              {songs.length} songs
              {isThisAlbumQueue ? " · playing from this album" : ""}
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
        {lastError && !album ? (
          <Text style={styles.error}>{lastError}</Text>
        ) : null}
      </View>
    ),
    [
      album,
      handlePlayAll,
      handleShuffle,
      isLoading,
      isThisAlbumQueue,
      lastError,
      router,
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
          data={isThisAlbumQueue ? queueForPlayback : songs}
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
            !isLoading && album ? (
              <Text style={styles.emptyTracks}>No tracks in this album.</Text>
            ) : null
          }
          extraData={`${activeIndex}-${isThisAlbumQueue}`}
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
  albumTitle: {
    color: authColors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  albumArtist: {
    color: authColors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 6,
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
