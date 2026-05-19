import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlbumGridSection } from "./AlbumGridSection";
import { LibraryFilterChips, type LibraryFilter } from "./LibraryFilterChips";
import { LibrarySkeleton } from "./LibrarySkeleton";
import { MediaCarousel } from "./MediaCarousel";
import type { Song } from "../../api/models/media";
import { getScrollBottomInset } from "../../navigation/layoutMetrics";
import { usePlayerActions } from "../../store/playerSelectors";
import { useEndpointStore } from "../../store/useEndpointStore";
import useLibraryStore from "../../store/useLibraryStore";
import { useRecentlyPlayedStore } from "../../store/useRecentlyPlayedStore";
import { authColors, authSpacing } from "../../theme/authTheme";
import { AuthGradientBackground } from "../auth/AuthGradientBackground";
import { SessionBanner } from "../auth/SessionBanner";

function EmptyLibraryHint() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>Your library is loading</Text>
      <Text style={styles.emptyBody}>
        Pull to refresh or check your server connection in Account.
      </Text>
    </View>
  );
}

export function LibraryHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<LibraryFilter>("all");

  const activeEndpoint = useEndpointStore((s) => s.getActiveEndpoint());
  const sessionWarning = useEndpointStore((s) => s.sessionWarning);
  const library = useLibraryStore((s) => s.library);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const lastError = useLibraryStore((s) => s.lastError);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const { playSong, playQueue } = usePlayerActions();

  const recentlyPlayed = useRecentlyPlayedStore((s) =>
    s.entries.map((entry) => entry.song),
  );

  const bottomInset = useMemo(
    () =>
      getScrollBottomInset(insets.bottom, {
        hasMiniPlayer: true,
        showTabBar: true,
      }),
    [insets.bottom],
  );

  const recentlyPlayedContext = useMemo(
    () => ({ type: "recent" as const, title: "Recently Played" }),
    [],
  );

  const librarySongsContext = useMemo(
    () => ({ type: "library" as const, title: "Library Songs" }),
    [],
  );

  const handleRecentlyPlayedPress = useCallback(
    (_item: Song, index: number) => {
      if (recentlyPlayed.length === 0) {
        return;
      }
      playQueue(recentlyPlayed, index, recentlyPlayedContext);
    },
    [playQueue, recentlyPlayed, recentlyPlayedContext],
  );

  const handleLibrarySongPress = useCallback(
    (item: Song, index: number) => {
      const queue = library.songs.length ? library.songs : [item];
      const startIndex = library.songs.length ? index : 0;
      playSong(item, queue, librarySongsContext, startIndex);
    },
    [library.songs, librarySongsContext, playSong],
  );

  const sections = useMemo(() => {
    const show = (keys: LibraryFilter[]) =>
      filter === "all" || keys.includes(filter);

    return {
      showRecent: show(["all", "recent"]),
      showAlbums: show(["all", "albums"]),
      showArtists: show(["all", "artists"]),
      showSongs: show(["all", "songs"]),
      showPlaylists: show(["all", "playlists"]),
    };
  }, [filter]);

  const isEmptyLibrary =
    library.albums.length === 0 &&
    library.artists.length === 0 &&
    library.songs.length === 0 &&
    !isLoading;

  return (
    <AuthGradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              loadLibrary({ force: true }).catch(() => undefined);
            }}
            tintColor={authColors.accent}
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + authSpacing.md,
          paddingBottom: bottomInset,
        }}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Your Library</Text>
            <Text style={styles.subtitle}>
              {activeEndpoint?.label ?? "Navidrome"}
            </Text>
          </View>
          <Pressable
            style={styles.searchButton}
            onPress={() => router.push("/(tabs)/search")}
            accessibilityLabel="Open search"
          >
            <Ionicons name="search" size={22} color={authColors.textPrimary} />
          </Pressable>
        </View>

        {sessionWarning ? <SessionBanner message={sessionWarning} /> : null}
        {lastError ? (
          <View style={styles.banner}>
            <SessionBanner message={lastError} variant="warning" />
          </View>
        ) : null}

        <LibraryFilterChips value={filter} onChange={setFilter} />

        {isLoading && library.albums.length === 0 ? <LibrarySkeleton /> : null}

        {sections.showRecent ? (
          <>
            <MediaCarousel
              title="Recently Played"
              items={recentlyPlayed}
              variant="song"
              onPressItem={(item, index) =>
                handleRecentlyPlayedPress(item as Song, index)
              }
            />
            <MediaCarousel
              title="Recently Added"
              items={library.recentlyAdded}
              variant="album"
            />
          </>
        ) : null}

        {sections.showAlbums ? (
          <>
            <MediaCarousel
              title="Made for You"
              items={library.randomAlbums}
              variant="album"
            />
            <AlbumGridSection title="Albums" albums={library.albums} />
          </>
        ) : null}

        {sections.showArtists ? (
          <MediaCarousel
            title="Artists"
            items={library.artists}
            variant="artist"
          />
        ) : null}

        {sections.showSongs ? (
          <MediaCarousel
            title="Songs"
            items={library.songs}
            variant="song"
            onPressItem={(item, index) =>
              handleLibrarySongPress(item as Song, index)
            }
          />
        ) : null}

        {sections.showPlaylists ? (
          <MediaCarousel
            title="Playlists"
            items={library.playlists}
            variant="playlist"
          />
        ) : null}

        {filter === "all" && library.genres.length > 0 ? (
          <View style={styles.genres}>
            <Text style={styles.genresTitle}>Genres</Text>
            {library.genres.slice(0, 8).map((genre) => (
              <Text key={genre.name} style={styles.genreItem}>
                {genre.name}
              </Text>
            ))}
          </View>
        ) : null}

        {isEmptyLibrary ? <EmptyLibraryHint /> : null}

        <View style={styles.favoritesPlaceholder}>
          <Text style={styles.favoritesLabel}>Favorites</Text>
          <Text style={styles.favoritesHint}>
            Coming soon — star tracks on your server.
          </Text>
        </View>
      </ScrollView>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: authSpacing.lg,
    marginBottom: authSpacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: authColors.surfaceHighlight,
  },
  banner: {
    paddingHorizontal: authSpacing.lg,
    marginBottom: authSpacing.sm,
  },
  genres: {
    paddingHorizontal: authSpacing.lg,
    marginBottom: authSpacing.lg,
  },
  genresTitle: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  genreItem: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  emptyWrap: {
    paddingHorizontal: authSpacing.lg,
    paddingVertical: authSpacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.xs,
  },
  emptyBody: {
    color: authColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  favoritesPlaceholder: {
    marginHorizontal: authSpacing.lg,
    marginTop: authSpacing.sm,
    marginBottom: authSpacing.lg,
    padding: authSpacing.md,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: authColors.border,
  },
  favoritesLabel: {
    color: authColors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  favoritesHint: {
    color: authColors.textMuted,
    fontSize: 13,
  },
});
