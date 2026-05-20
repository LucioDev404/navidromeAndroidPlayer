import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { CachedCover } from "../../src/components/ui/CachedCover";
import { getScrollBottomInset } from "../../src/navigation/layoutMetrics";
import {
  openAlbum,
  openArtist,
  openPlaylist,
} from "../../src/navigation/navigationHelpers";
import { usePlayerActions } from "../../src/store/playerSelectors";
import { useIsAuthenticated } from "../../src/store/useAuthStore";
import { useSearchStore } from "../../src/store/useSearchStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SearchResult = {
  key: string;
  title: string;
  subtitle: string;
  coverUrl?: string;
  category: string;
  onPress: () => void;
};

const ResultRow = memo(function ResultRow({
  title,
  subtitle,
  coverUrl,
  onPress,
}: Omit<SearchResult, "key" | "category">) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <CachedCover uri={coverUrl} size={48} borderRadius={10} />
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
});

const SectionHeader = memo(function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
});

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTextGroup}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineLong} />
      </View>
    </View>
  );
});

const SectionEmpty = memo(function SectionEmpty({
  message,
}: {
  message: string;
}) {
  return (
    <View style={styles.sectionEmpty}>
      <Text style={styles.sectionEmptyText}>{message}</Text>
    </View>
  );
});

export default function SearchTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useIsAuthenticated();
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const clear = useSearchStore((s) => s.clear);
  const isSearching = useSearchStore((s) => s.isSearching);
  const lastError = useSearchStore((s) => s.lastError);
  const artists = useSearchStore((s) => s.artists);
  const albums = useSearchStore((s) => s.albums);
  const songs = useSearchStore((s) => s.songs);
  const playlists = useSearchStore((s) => s.playlists);
  const genres = useSearchStore((s) => s.genres);
  const { playSong } = usePlayerActions();

  useEffect(() => () => clear(), [clear]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [query, isSearching, songs.length, albums.length, artists.length, playlists.length, genres.length]);

  const searchContext = useMemo(
    () => ({ type: "search" as const, title: "Search" }),
    [],
  );

  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  const totalResults =
    songs.length + albums.length + artists.length + playlists.length + genres.length;

  const topResult = useMemo(() => {
    if (!hasQuery || isSearching) {
      return null;
    }

    if (songs.length > 0) {
      const item = songs[0];
      return {
        key: `top-song-${item.id}`,
        title: item.title,
        subtitle: `${item.artist} · ${item.album}`,
        coverUrl: item.coverArtUrl,
        category: "Song",
        onPress: () => playSong(item, songs, searchContext, 0),
      };
    }

    if (albums.length > 0) {
      const item = albums[0];
      return {
        key: `top-album-${item.id}`,
        title: item.title,
        subtitle: item.artist,
        coverUrl: item.coverArtUrl,
        category: "Album",
        onPress: () => openAlbum(router, item.id),
      };
    }

    if (artists.length > 0) {
      const item = artists[0];
      return {
        key: `top-artist-${item.id}`,
        title: item.name,
        subtitle: `${item.albumCount} albums`,
        coverUrl: item.coverArtUrl,
        category: "Artist",
        onPress: () => openArtist(router, item.id),
      };
    }

    if (playlists.length > 0) {
      const item = playlists[0];
      return {
        key: `top-playlist-${item.id}`,
        title: item.name,
        subtitle: `${item.songCount} songs`,
        coverUrl: item.coverArtUrl,
        category: "Playlist",
        onPress: () => openPlaylist(router, item.id),
      };
    }

    if (genres.length > 0) {
      const item = genres[0];
      return {
        key: `top-genre-${item.name}`,
        title: item.name,
        subtitle: `${item.songCount} songs · ${item.albumCount} albums`,
        coverUrl: undefined,
        category: "Genre",
        onPress: () => setQuery(item.name),
      };
    }

    return null;
  }, [albums, artists, genres, hasQuery, isSearching, playSong, playlists, router, searchContext, setQuery, songs]);

  const songsPreview = useMemo(() => songs.slice(0, 4), [songs]);
  const albumsPreview = useMemo(() => albums.slice(0, 4), [albums]);
  const artistsPreview = useMemo(() => artists.slice(0, 4), [artists]);
  const playlistsPreview = useMemo(() => playlists.slice(0, 4), [playlists]);
  const genresPreview = useMemo(() => genres.slice(0, 5), [genres]);

  const bottomInset = useMemo(
    () => getScrollBottomInset(insets.bottom, { hasMiniPlayer: true }),
    [insets.bottom],
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthGradientBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + authSpacing.md,
            paddingBottom: bottomInset,
          },
        ]}
      >
        <Text style={styles.title}>Search</Text>
        <Text style={styles.hint}>
          Find songs, albums, artists, playlists, and genres in your library.
        </Text>

        <View style={styles.searchInputWrapper}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your collection"
            placeholderTextColor={authColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />
          {hasQuery ? (
            <Pressable onPress={() => setQuery("")} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.summaryText}>
          {isSearching
            ? "Searching across songs, albums, artists, playlists and genres..."
            : hasQuery
            ? `${totalResults} result${totalResults === 1 ? "" : "s"}`
            : "Start typing to explore your collection."}
        </Text>

        {lastError ? <Text style={styles.error}>{lastError}</Text> : null}

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isSearching ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : !hasQuery ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>Search premium discovery.</Text>
              <Text style={styles.emptyStateSubtitle}>
                Use filters and fast results to jump directly to the music you want.
              </Text>
            </View>
          ) : totalResults === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>No matches found</Text>
              <Text style={styles.emptyStateSubtitle}>
                We couldn’t find anything for “{normalizedQuery}”. Try a broader
                keyword.
              </Text>
            </View>
          ) : (
            <>
              {topResult ? (
                <View style={styles.topResultCard}>
                  <Text style={styles.topSectionLabel}>Top result</Text>
                  <Pressable style={styles.topCardContent} onPress={topResult.onPress}>
                    <CachedCover
                      uri={topResult.coverUrl}
                      size={120}
                      borderRadius={18}
                    />
                    <View style={styles.topCardText}>
                      <Text style={styles.topCardTitle} numberOfLines={2}>
                        {topResult.title}
                      </Text>
                      <Text style={styles.topCardSubtitle} numberOfLines={1}>
                        {topResult.subtitle}
                      </Text>
                      <View style={styles.topCardBadge}>
                        <Text style={styles.topCardBadgeText}>{topResult.category}</Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.sectionBlock}>
                <SectionHeader title="Songs" count={songs.length} />
                {songsPreview.length > 0 ? (
                  songsPreview.map((item, index) => (
                    <ResultRow
                      key={`song-${item.id}`}
                      title={item.title}
                      subtitle={`${item.artist} · ${item.album}`}
                      coverUrl={item.coverArtUrl}
                      onPress={() => playSong(item, songs, searchContext, index)}
                    />
                  ))
                ) : (
                  <SectionEmpty message="No songs match this search." />
                )}
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader title="Albums" count={albums.length} />
                {albumsPreview.length > 0 ? (
                  albumsPreview.map((item) => (
                    <ResultRow
                      key={`album-${item.id}`}
                      title={item.title}
                      subtitle={item.artist}
                      coverUrl={item.coverArtUrl}
                      onPress={() => openAlbum(router, item.id)}
                    />
                  ))
                ) : (
                  <SectionEmpty message="No albums match this search." />
                )}
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader title="Artists" count={artists.length} />
                {artistsPreview.length > 0 ? (
                  artistsPreview.map((item) => (
                    <ResultRow
                      key={`artist-${item.id}`}
                      title={item.name}
                      subtitle={`${item.albumCount} albums`}
                      coverUrl={item.coverArtUrl}
                      onPress={() => openArtist(router, item.id)}
                    />
                  ))
                ) : (
                  <SectionEmpty message="No artists match this search." />
                )}
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader title="Playlists" count={playlists.length} />
                {playlistsPreview.length > 0 ? (
                  playlistsPreview.map((item) => (
                    <ResultRow
                      key={`playlist-${item.id}`}
                      title={item.name}
                      subtitle={`${item.songCount} songs`}
                      coverUrl={item.coverArtUrl}
                      onPress={() => openPlaylist(router, item.id)}
                    />
                  ))
                ) : (
                  <SectionEmpty message="No playlists match this search." />
                )}
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader title="Genres" count={genres.length} />
                {genresPreview.length > 0 ? (
                  <View style={styles.genreGrid}>
                    {genresPreview.map((item) => (
                      <Pressable
                        key={`genre-${item.name}`}
                        style={styles.genreChip}
                        onPress={() => setQuery(item.name)}
                      >
                        <Text style={styles.genreChipText}>{item.name}</Text>
                        <Text style={styles.genreChipCount}>
                          {item.songCount} songs
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <SectionEmpty message="No genres match this search." />
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: authSpacing.lg,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  hint: {
    color: authColors.textSecondary,
    marginBottom: authSpacing.md,
    fontSize: 15,
    lineHeight: 22,
  },
  searchInputWrapper: {
    width: "100%",
    marginBottom: authSpacing.sm,
    position: "relative",
  },
  input: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: authColors.surface,
    padding: authSpacing.md,
    color: authColors.textPrimary,
    backgroundColor: authColors.backgroundElevated,
  },
  clearButton: {
    position: "absolute",
    right: authSpacing.md,
    top: authSpacing.md,
  },
  clearText: {
    color: authColors.accent,
    fontWeight: "600",
  },
  summaryText: {
    color: authColors.textSecondary,
    marginBottom: authSpacing.md,
    fontSize: 13,
  },
  error: {
    color: authColors.danger,
    marginBottom: authSpacing.sm,
  },
  contentContainer: {
    paddingBottom: authSpacing.lg,
  },
  emptyStateContainer: {
    backgroundColor: authColors.backgroundElevated,
    borderRadius: authSpacing.lg,
    padding: authSpacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: authSpacing.md,
  },
  emptyStateTitle: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: authSpacing.xs,
  },
  emptyStateSubtitle: {
    color: authColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  topResultCard: {
    backgroundColor: authColors.surface,
    borderRadius: authSpacing.lg,
    padding: authSpacing.md,
    marginBottom: authSpacing.lg,
  },
  topSectionLabel: {
    color: authColors.accent,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  topCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topCardText: {
    flex: 1,
    marginLeft: authSpacing.md,
  },
  topCardTitle: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  topCardSubtitle: {
    color: authColors.textSecondary,
    fontSize: 14,
    marginBottom: authSpacing.sm,
  },
  topCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(29,185,84,0.12)",
    borderRadius: authSpacing.xs,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: 4,
  },
  topCardBadgeText: {
    color: authColors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  sectionBlock: {
    marginBottom: authSpacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: authSpacing.sm,
  },
  sectionTitle: {
    color: authColors.textPrimary,
    fontSize: 16,
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
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  genreChip: {
    backgroundColor: authColors.surface,
    borderRadius: authSpacing.lg,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.md,
    marginBottom: authSpacing.sm,
    marginHorizontal: 4,
    minWidth: 120,
  },
  genreChipText: {
    color: authColors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  genreChipCount: {
    color: authColors.textSecondary,
    fontSize: 12,
  },
  sectionEmpty: {
    backgroundColor: authColors.backgroundElevated,
    borderRadius: authSpacing.lg,
    padding: authSpacing.md,
  },
  sectionEmptyText: {
    color: authColors.textSecondary,
    fontSize: 13,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: authColors.surface,
    borderRadius: authSpacing.lg,
    padding: authSpacing.md,
    marginBottom: authSpacing.sm,
  },
  skeletonImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: authColors.border,
  },
  skeletonTextGroup: {
    flex: 1,
    marginLeft: authSpacing.md,
  },
  skeletonLineShort: {
    width: "50%",
    height: 12,
    borderRadius: 6,
    backgroundColor: authColors.border,
    marginBottom: authSpacing.sm,
  },
  skeletonLineLong: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    backgroundColor: authColors.border,
  },
});
