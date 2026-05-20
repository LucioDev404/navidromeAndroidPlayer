import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../src/components/auth/AuthGradientBackground";
import { openGenre } from "../src/navigation/navigationHelpers";
import useLibraryStore from "../src/store/useLibraryStore";
import { authColors, authSpacing } from "../src/theme/authTheme";

const GenreCardSkeleton = () => (
  <View style={styles.genreCard}>
    <View style={styles.skeletonBlock} />
    <View style={styles.skeletonLineShort} />
    <View style={styles.skeletonLineLong} />
  </View>
);

export default function GenresScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const library = useLibraryStore((s) => s.library);
  const isLoading = useLibraryStore((s) => s.isLoading);
  const isHydrated = useLibraryStore((s) => s.isHydrated);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);

  useEffect(() => {
    if (!isHydrated) {
      loadLibrary().catch(() => undefined);
    }
  }, [isHydrated, loadLibrary]);

  const genres = useMemo(
    () => [...library.genres].sort((a, b) => b.songCount - a.songCount),
    [library.genres],
  );

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

        <View style={styles.genreGrid}>
          {isLoading && genres.length === 0
            ? Array.from({ length: 8 }).map((_, index) => (
                <GenreCardSkeleton key={`skeleton-${index}`} />
              ))
            : genres.map((genre) => (
                <Pressable
                  key={genre.name}
                  style={styles.genreCard}
                  onPress={() => openGenre(router, genre.name)}
                >
                  <Text style={styles.genreCardTitle}>{genre.name}</Text>
                  <Text style={styles.genreCardSubtitle} numberOfLines={2}>
                    {genre.songCount} songs · {genre.albumCount} albums
                  </Text>
                </Pressable>
              ))}
        </View>

        {!isLoading && genres.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No genres available</Text>
            <Text style={styles.emptyText}>
              Your server didn’t return any genres yet. Refresh the library in
              Account.
            </Text>
          </View>
        ) : null}
      </ScrollView>
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
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: authSpacing.sm,
  },
  genreCard: {
    width: "48%",
    minHeight: 120,
    marginBottom: authSpacing.sm,
    borderRadius: authSpacing.lg,
    backgroundColor: authColors.surface,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    justifyContent: "space-between",
  },
  genreCardTitle: {
    color: authColors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  genreCardSubtitle: {
    color: authColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  skeletonBlock: {
    width: "70%",
    height: 20,
    borderRadius: 10,
    backgroundColor: authColors.border,
    marginBottom: authSpacing.sm,
  },
  skeletonLineShort: {
    width: "40%",
    height: 12,
    borderRadius: 6,
    backgroundColor: authColors.border,
    marginBottom: authSpacing.xs,
  },
  skeletonLineLong: {
    width: "60%",
    height: 12,
    borderRadius: 6,
    backgroundColor: authColors.border,
  },
  emptyState: {
    marginTop: authSpacing.xl,
    padding: authSpacing.lg,
    borderRadius: authSpacing.lg,
    backgroundColor: authColors.backgroundElevated,
  },
  emptyTitle: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.xs,
  },
  emptyText: {
    color: authColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
