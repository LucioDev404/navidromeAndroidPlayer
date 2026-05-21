import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchGenres } from "../src/api/subsonic/services/libraryService";
import { AuthGradientBackground } from "../src/components/auth/AuthGradientBackground";
import GenreGrid from "../src/components/library/GenreGrid";
import { openGenre } from "../src/navigation/navigationHelpers";
import { useEndpointStore } from "../src/store/useEndpointStore";
import useLibraryStore from "../src/store/useLibraryStore";
import { authColors, authSpacing } from "../src/theme/authTheme";

type GenreListItem =
  | { key: string; skeleton: true }
  | {
      key: string;
      skeleton: false;
      name: string;
      songCount: number;
      albumCount: number;
      coverUrl?: string;
    };

export default function GenresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const library = useLibraryStore((s) => s.library);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const isHydrated = useLibraryStore((s) => s.isHydrated);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);

  const [fallbackGenres, setFallbackGenres] = useState(library.genres);

  useEffect(() => {
    if (!isHydrated) {
      loadLibrary().catch(() => undefined);
    }
  }, [isHydrated, loadLibrary]);

  useEffect(() => {
    setFallbackGenres(library.genres);
  }, [library.genres]);

  useEffect(() => {
    async function load() {
      if ((library.genres?.length ?? 0) > 0) return;
      const endpoint = useEndpointStore.getState().getActiveEndpoint();
      if (!endpoint || !useEndpointStore.getState().isSessionAuthenticated)
        return;
      try {
        const client = await useEndpointStore.getState().getActiveClient();
        if (!client) return;
        const raw = await fetchGenres(client);
        setFallbackGenres(
          raw.map((g) => ({
            name: g.value,
            songCount: g.songCount ?? 0,
            albumCount: g.albumCount ?? 0,
          })),
        );
      } catch (e) {
        // best-effort fallback
      }
    }
    load();
  }, [library.genres]);

  const genres = useMemo(
    () =>
      [...(fallbackGenres ?? [])].sort(
        (a, b) => (b.songCount ?? 0) - (a.songCount ?? 0),
      ),
    [fallbackGenres],
  );

  const genreData = useMemo<GenreListItem[]>(
    () =>
      isLoading && genres.length === 0
        ? Array.from({ length: 8 }, (_, index) => ({
            key: `skeleton-${index}`,
            skeleton: true,
          }))
        : genres.map((genre) => ({
            key: genre.name,
            skeleton: false,
            name: genre.name,
            songCount: genre.songCount ?? 0,
            albumCount: genre.albumCount ?? 0,
          })),
    [genres, isLoading],
  );

  const renderHeader = useMemo(
    () => (
      <>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Genres</Text>
            <Text style={styles.subtitle}>
              Browse curated genre collections built from your library.
            </Text>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityLabel="Close genres"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.topBar}>
          <Text style={styles.statLabel}>Genres</Text>
          <Text style={styles.statValue}>{genres.length}</Text>
        </View>
      </>
    ),
    [genres.length, router],
  );

  const renderEmpty = useMemo(
    () =>
      !isLoading && genres.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No genres available</Text>
          <Text style={styles.emptyText}>
            Your server didn’t return any genres yet. Refresh the library in
            Account.
          </Text>
        </View>
      ) : null,
    [genres.length, isLoading],
  );

  return (
    <AuthGradientBackground>
      <GenreGrid
        data={genreData}
        onPressGenre={(genreName) => openGenre(router, genreName)}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + authSpacing.md,
            paddingBottom: authSpacing.lg,
            paddingHorizontal: authSpacing.lg,
          },
        ]}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderEmpty}
      />
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: authSpacing.md,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: "70%",
  },
  closeButton: {
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  closeText: {
    color: authColors.accent,
    fontWeight: "700",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: authSpacing.md,
  },
  statLabel: {
    color: authColors.textSecondary,
    fontSize: 13,
  },
  statValue: {
    color: authColors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  content: {
    paddingBottom: authSpacing.lg,
  },
  emptyState: {
    paddingTop: authSpacing.lg,
  },
  emptyTitle: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  emptyText: {
    color: authColors.textSecondary,
    lineHeight: 20,
  },
});
