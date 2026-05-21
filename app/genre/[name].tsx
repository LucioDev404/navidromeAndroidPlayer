import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useCallback } from "react";
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { MediaCarousel } from "../../src/components/library/MediaCarousel";
import { CachedCover } from "../../src/components/ui/CachedCover";
import { usePlayerActions } from "../../src/store/playerSelectors";
import useLibraryStore from "../../src/store/useLibraryStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ListRowProps = {
  title: string;
  subtitle: string;
  coverUrl?: string;
  onPress: () => void;
};

function ListRow({ title, subtitle, coverUrl, onPress }: ListRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <CachedCover uri={coverUrl} size={52} borderRadius={12} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export default function GenreDetailScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const library = useLibraryStore((s) => s.library);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const isHydrated = useLibraryStore((s) => s.isHydrated);
  const { playSong, playQueue } = usePlayerActions();

  const genreNameRaw = params.name ?? "";
  const genreName = decodeURIComponent(
    Array.isArray(genreNameRaw) ? genreNameRaw[0] : genreNameRaw,
  ).trim();

  useEffect(() => {
    if (!isHydrated) {
      loadLibrary().catch(() => undefined);
    }
  }, [isHydrated, loadLibrary]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [genreName, isLoading]);

  const filteredSongs = useMemo(
    () =>
      library.songs.filter(
        (song) => song.genre?.toLowerCase() === genreName.toLowerCase(),
      ),
    [genreName, library.songs],
  );

  const filteredAlbums = useMemo(
    () =>
      library.albums.filter(
        (album) => album.genre?.toLowerCase() === genreName.toLowerCase(),
      ),
    [genreName, library.albums],
  );

  const filteredArtists = useMemo(() => {
    const artistIds = new Set<string>();
    const artistsMap = new Map<
      string,
      { id: string; name: string; albumCount: number; coverArtUrl?: string }
    >();

    filteredSongs.forEach((song) => {
      const artistId = song.artistId || song.artist;
      if (!artistId || artistIds.has(artistId)) {
        return;
      }
      artistIds.add(artistId);
      artistsMap.set(artistId, {
        id: artistId,
        name: song.artist,
        albumCount: 0,
        coverArtUrl: song.coverArtUrl,
      });
    });

    filteredAlbums.forEach((album) => {
      const artistId = album.artistId || album.artist;
      if (!artistId) {
        return;
      }
      const existing = artistsMap.get(artistId);
      if (existing) {
        existing.albumCount = Math.max(existing.albumCount, 1);
      } else if (!artistIds.has(artistId)) {
        artistIds.add(artistId);
        artistsMap.set(artistId, {
          id: artistId,
          name: album.artist,
          albumCount: 1,
          coverArtUrl: album.coverArtUrl,
        });
      }
    });

    const libraryArtists = library.artists.filter((artist) =>
      artistIds.has(artist.id),
    );

    libraryArtists.forEach((artist) => {
      const existing = artistsMap.get(artist.id);
      if (existing) {
        existing.albumCount = Math.max(existing.albumCount, artist.albumCount);
        existing.coverArtUrl = existing.coverArtUrl ?? artist.coverArtUrl;
      } else {
        artistIds.add(artist.id);
        artistsMap.set(artist.id, {
          id: artist.id,
          name: artist.name,
          albumCount: artist.albumCount,
          coverArtUrl: artist.coverArtUrl,
        });
      }
    });

    return Array.from(artistsMap.values()).slice(0, 12);
  }, [filteredAlbums, filteredSongs, library.artists]);

  const topSongs = useMemo(() => filteredSongs.slice(0, 8), [filteredSongs]);
  const topAlbums = useMemo(() => filteredAlbums.slice(0, 8), [filteredAlbums]);
  const topArtists = useMemo(
    () => filteredArtists.slice(0, 8),
    [filteredArtists],
  );

  const genreCount =
    filteredSongs.length + filteredAlbums.length + filteredArtists.length;

  const handleSongPress = useCallback(
    (item: (typeof filteredSongs)[number], index: number) => {
      playSong(item, filteredSongs, {
        type: "library",
        id: `genre:${genreName}`,
        title: genreName,
      },
      index,
      );
    },
    [filteredSongs, genreName, playSong],
  );

  const handlePlayAll = useCallback(() => {
    if (!filteredSongs || filteredSongs.length === 0) return;
    playQueue(filteredSongs, 0, {
      type: "library",
      id: `genre:${genreName}`,
      title: genreName,
    });
  }, [filteredSongs, genreName, playQueue]);

  if (!genreName) {
    return null;
  }

  return (
    <AuthGradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + authSpacing.md,
          paddingBottom: authSpacing.lg,
          paddingHorizontal: authSpacing.lg,
        }}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.genreLabel}>Genre</Text>
            <Text style={styles.title}>{genreName}</Text>
            <Text style={styles.genreSummary} numberOfLines={2}>
              {filteredSongs.length} songs · {filteredAlbums.length} albums ·{" "}
              {filteredArtists.length} artists
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable style={styles.playButton} onPress={handlePlayAll}>
              <Text style={styles.playButtonText}>Play All</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={() => router.back()}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>

        {isLoading && !isHydrated ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading genre content...</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top songs</Text>
              <Text style={styles.sectionCount}>{filteredSongs.length}</Text>
            </View>
            {topSongs.length > 0 ? (
              <FlatList
                data={topSongs}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ListRow
                    title={item.title}
                    subtitle={`${item.artist} · ${item.album}`}
                    coverUrl={item.coverArtUrl}
                    onPress={() => handleSongPress(item, index)}
                  />
                )}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.sectionEmpty}>
                <Text style={styles.sectionEmptyText}>
                  No songs found for this genre.
                </Text>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Albums</Text>
              <Text style={styles.sectionCount}>{filteredAlbums.length}</Text>
            </View>
            {topAlbums.length > 0 ? (
              <MediaCarousel
                title=""
                items={topAlbums}
                variant="album"
                style={styles.carouselOverride}
              />
            ) : (
              <View style={styles.sectionEmpty}>
                <Text style={styles.sectionEmptyText}>
                  No albums found for this genre.
                </Text>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Artists</Text>
              <Text style={styles.sectionCount}>{filteredArtists.length}</Text>
            </View>
            {topArtists.length > 0 ? (
              <MediaCarousel
                title=""
                items={topArtists.map((artist) => ({
                  id: artist.id,
                  name: artist.name,
                  albumCount: artist.albumCount,
                  coverArtUrl: artist.coverArtUrl,
                }))}
                variant="artist"
              />
            ) : (
              <View style={styles.sectionEmpty}>
                <Text style={styles.sectionEmptyText}>
                  No artists match this genre.
                </Text>
              </View>
            )}

            {genreCount === 0 ? (
              <View style={styles.sectionEmptyLarge}>
                <Text style={styles.sectionEmptyText}>
                  This genre has no indexed items in your library.
                </Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: authSpacing.md,
  },
  titleBlock: {
    flex: 1,
    marginRight: authSpacing.md,
  },
  genreLabel: {
    color: authColors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: authSpacing.xs,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  genreSummary: {
    color: authColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  closeText: {
    color: authColors.accent,
    fontWeight: "700",
  },
  playButton: {
    backgroundColor: authColors.accent,
    paddingHorizontal: authSpacing.md,
    paddingVertical: authSpacing.sm,
    borderRadius: authSpacing.sm,
    marginRight: authSpacing.sm,
  },
  playButtonText: {
    color: authColors.surface,
    fontWeight: "800",
  },
  loadingState: {
    padding: authSpacing.lg,
    borderRadius: authSpacing.lg,
    backgroundColor: authColors.surface,
    marginBottom: authSpacing.lg,
  },
  loadingText: {
    color: authColors.textSecondary,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: authSpacing.lg,
    marginBottom: authSpacing.sm,
  },
  sectionTitle: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionCount: {
    color: authColors.textSecondary,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: authSpacing.sm,
  },
  rowText: {
    flex: 1,
    marginLeft: authSpacing.sm,
  },
  rowTitle: {
    color: authColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  rowSubtitle: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sectionEmpty: {
    backgroundColor: authColors.surface,
    borderRadius: authSpacing.lg,
    padding: authSpacing.md,
  },
  sectionEmptyLarge: {
    backgroundColor: authColors.surface,
    borderRadius: authSpacing.lg,
    padding: authSpacing.lg,
    marginTop: authSpacing.md,
  },
  sectionEmptyText: {
    color: authColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  carouselOverride: {
    marginTop: -authSpacing.sm,
  },
});
