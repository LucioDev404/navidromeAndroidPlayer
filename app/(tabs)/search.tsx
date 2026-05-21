import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shallow } from "zustand/shallow";

import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { CachedCover } from "../../src/components/ui/CachedCover";
import { getScrollBottomInset } from "../../src/navigation/layoutMetrics";
import {
  openAlbum,
  openArtist,
  openGenre,
  openPlaylist,
} from "../../src/navigation/navigationHelpers";
import { usePlayerActions } from "../../src/store/playerSelectors";
import { useIsAuthenticated } from "../../src/store/useAuthStore";
import { useSearchStore } from "../../src/store/useSearchStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";

type SearchResult = {
  key: string;
  title: string;
  subtitle: string;
  coverUrl?: string;
  category: string;
  onPress: () => void;
};

type SearchListItem =
  | {
      type: "top-result";
      key: string;
      title: string;
      subtitle: string;
      coverUrl?: string;
      category: string;
      onPress: () => void;
    }
  | {
      type: "section-header";
      key: string;
      title: string;
      count: number;
    }
  | {
      type: "result";
      key: string;
      title: string;
      subtitle: string;
      coverUrl?: string;
      onPress: () => void;
    }
  | {
      type: "section-empty";
      key: string;
      message: string;
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

const TopResultCard = memo(function TopResultCard({
  title,
  subtitle,
  coverUrl,
  category,
  onPress,
}: Omit<SearchResult, "key">) {
  return (
    <View style={styles.topResultCard}>
      <Text style={styles.topSectionLabel}>Top result</Text>
      <Pressable style={styles.topCardContent} onPress={onPress}>
        <CachedCover uri={coverUrl} size={120} borderRadius={18} />
        <View style={styles.topCardText}>
          <Text style={styles.topCardTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.topCardSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={styles.topCardBadge}>
            <Text style={styles.topCardBadgeText}>{category}</Text>
          </View>
        </View>
      </Pressable>
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
  const {
    query,
    setQuery,
    clear,
    isSearching,
    lastError,
    artists,
    albums,
    songs,
    playlists,
    genres,
  } = useSearchStore(
    (s) => ({
      query: s.query,
      setQuery: s.setQuery,
      clear: s.clear,
      isSearching: s.isSearching,
      lastError: s.lastError,
      artists: s.artists,
      albums: s.albums,
      songs: s.songs,
      playlists: s.playlists,
      genres: s.genres,
    }),
    shallow,
  );
  const { playSong } = usePlayerActions();

  useEffect(() => () => clear(), [clear]);

  const searchContext = useMemo(
    () => ({ type: "search" as const, title: "Search" }),
    [],
  );

  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  const totalResults =
    songs.length +
    albums.length +
    artists.length +
    playlists.length +
    genres.length;

  const topResult = useMemo(() => {
    if (!hasQuery || isSearching) {
      return null;
    }

    if (songs.length > 0) {
      const item = songs[0];
      return {
        type: "top-result" as const,
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
        type: "top-result" as const,
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
        type: "top-result" as const,
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
        type: "top-result" as const,
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
        type: "top-result" as const,
        key: `top-genre-${item.name}`,
        title: item.name,
        subtitle: `${item.songCount} songs · ${item.albumCount} albums`,
        coverUrl: undefined,
        category: "Genre",
        onPress: () => setQuery(item.name),
      };
    }

    return null;
  }, [
    albums,
    artists,
    genres,
    hasQuery,
    isSearching,
    playSong,
    playlists,
    router,
    searchContext,
    setQuery,
    songs,
  ]);

  const songsPreview = useMemo(() => songs.slice(0, 4), [songs]);
  const albumsPreview = useMemo(() => albums.slice(0, 4), [albums]);
  const artistsPreview = useMemo(() => artists.slice(0, 4), [artists]);
  const playlistsPreview = useMemo(() => playlists.slice(0, 4), [playlists]);
  const genresPreview = useMemo(() => genres.slice(0, 5), [genres]);

  const resultItems = useMemo<SearchListItem[]>(() => {
    if (!hasQuery || isSearching) {
      return [];
    }

    const items: SearchListItem[] = [];

    if (topResult) {
      items.push(topResult);
    }

    const appendSection = (
      title: string,
      count: number,
      preview: {
        id: string;
        title: string;
        subtitle: string;
        coverUrl?: string;
        onPress: () => void;
      }[],
      emptyMessage: string,
    ) => {
      items.push({
        type: "section-header",
        key: `section-${title}`,
        title,
        count,
      });

      if (preview.length > 0) {
        preview.forEach((item) => {
          items.push({
            type: "result",
            key: `${title.toLowerCase()}-${item.id}`,
            title: item.title,
            subtitle: item.subtitle,
            coverUrl: item.coverUrl,
            onPress: item.onPress,
          });
        });
      } else {
        items.push({
          type: "section-empty",
          key: `empty-${title}`,
          message: emptyMessage,
        });
      }
    };

    appendSection(
      "Songs",
      songs.length,
      songsPreview.map((item, index) => ({
        id: item.id,
        title: item.title,
        subtitle: `${item.artist} · ${item.album}`,
        coverUrl: item.coverArtUrl,
        onPress: () => playSong(item, songs, searchContext, index),
      })),
      "No songs match this search.",
    );

    appendSection(
      "Albums",
      albums.length,
      albumsPreview.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.artist,
        coverUrl: item.coverArtUrl,
        onPress: () => openAlbum(router, item.id),
      })),
      "No albums match this search.",
    );

    appendSection(
      "Artists",
      artists.length,
      artistsPreview.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: `${item.albumCount} albums`,
        coverUrl: item.coverArtUrl,
        onPress: () => openArtist(router, item.id),
      })),
      "No artists match this search.",
    );

    appendSection(
      "Playlists",
      playlists.length,
      playlistsPreview.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: `${item.songCount} songs`,
        coverUrl: item.coverArtUrl,
        onPress: () => openPlaylist(router, item.id),
      })),
      "No playlists match this search.",
    );

    appendSection(
      "Genres",
      genres.length,
      genresPreview.map((item) => ({
        id: item.name,
        title: item.name,
        subtitle: `${item.songCount} songs`,
        coverUrl: undefined,
        onPress: () => openGenre(router, item.name),
      })),
      "No genres match this search.",
    );

    return items;
  }, [
    albums.length,
    albumsPreview,
    artists.length,
    artistsPreview,
    genres.length,
    genresPreview,
    hasQuery,
    isSearching,
    playSong,
    searchContext,
    songs,
    songsPreview,
    playlists.length,
    playlistsPreview,
    router,
    topResult,
  ]);

  const renderSearchItem = useCallback(({ item }: { item: SearchListItem }) => {
    switch (item.type) {
      case "top-result":
        return (
          <TopResultCard
            title={item.title}
            subtitle={item.subtitle}
            coverUrl={item.coverUrl}
            category={item.category}
            onPress={item.onPress}
          />
        );
      case "section-header":
        return <SectionHeader title={item.title} count={item.count} />;
      case "result":
        return (
          <ResultRow
            title={item.title}
            subtitle={item.subtitle}
            coverUrl={item.coverUrl}
            onPress={item.onPress}
          />
        );
      case "section-empty":
        return <SectionEmpty message={item.message} />;
    }
  }, []);

  const bottomInset = useMemo(
    () => getScrollBottomInset(insets.bottom, { hasMiniPlayer: true }),
    [insets.bottom],
  );

  const skeletonItems = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => ({ key: `skeleton-${index}` })),
    [],
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

        {isSearching ? (
          <FlatList
            data={skeletonItems}
            keyExtractor={(item) => item.key}
            renderItem={() => <SkeletonCard />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          />
        ) : !hasQuery ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>
              Search premium discovery.
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Use filters and fast results to jump directly to the music you
              want.
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
          <FlatList
            data={resultItems}
            keyExtractor={(item) => item.key}
            renderItem={renderSearchItem}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={12}
            windowSize={8}
            contentContainerStyle={styles.contentContainer}
          />
        )}
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
