import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { getScrollBottomInset } from "../../src/navigation/layoutMetrics";
import { useIsAuthenticated } from "../../src/store/useAuthStore";
import { usePlayerStore } from "../../src/store/usePlayerStore";
import { useSearchStore } from "../../src/store/useSearchStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";

function ResultRow({
  title,
  subtitle,
  coverUrl,
  onPress,
}: {
  title: string;
  subtitle: string;
  coverUrl?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
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

export default function SearchTabScreen() {
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
  const playSong = usePlayerStore((s) => s.playSong);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentSong));

  useEffect(() => () => clear(), [clear]);

  if (!isAuthenticated) {
    return null;
  }

  const results = [
    ...songs.map((item) => ({
      key: `song-${item.id}`,
      title: item.title,
      subtitle: `${item.artist} · ${item.album}`,
      coverUrl: item.coverArtUrl,
      onPress: () => playSong(item, songs),
    })),
    ...albums.map((item) => ({
      key: `album-${item.id}`,
      title: item.title,
      subtitle: item.artist,
      coverUrl: item.coverArtUrl,
      onPress: () => undefined,
    })),
    ...artists.map((item) => ({
      key: `artist-${item.id}`,
      title: item.name,
      subtitle: `${item.albumCount} albums`,
      coverUrl: item.coverArtUrl,
      onPress: () => undefined,
    })),
  ];

  return (
    <AuthGradientBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + authSpacing.md,
            paddingBottom: getScrollBottomInset(insets.bottom, {
              hasMiniPlayer,
            }),
          },
        ]}
      >
        <Text style={styles.title}>Search</Text>
        <Text style={styles.hint}>
          Find artists, albums, and songs on your server.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="What do you want to listen to?"
          placeholderTextColor={authColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        {isSearching ? (
          <ActivityIndicator color={authColors.accent} style={styles.loader} />
        ) : null}
        {lastError ? <Text style={styles.error}>{lastError}</Text> : null}

        <FlatList
          data={results}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <ResultRow
              title={item.title}
              subtitle={item.subtitle}
              coverUrl={item.coverUrl}
              onPress={item.onPress}
            />
          )}
          ListEmptyComponent={
            query.trim() && !isSearching && !lastError ? (
              <Text style={styles.empty}>No results for “{query.trim()}”.</Text>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
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
    fontSize: 30,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  hint: {
    color: authColors.textSecondary,
    marginBottom: authSpacing.md,
  },
  input: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: 14,
    color: authColors.textPrimary,
    marginBottom: authSpacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  loader: {
    marginBottom: authSpacing.sm,
  },
  error: {
    color: authColors.danger,
    marginBottom: authSpacing.sm,
  },
  empty: {
    color: authColors.textSecondary,
    textAlign: "center",
    marginTop: authSpacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: authSpacing.sm,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: authSpacing.sm,
  },
  thumbPlaceholder: {
    backgroundColor: authColors.surfaceHighlight,
  },
  rowText: {
    flex: 1,
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
});
