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

import type { Album } from "../../api/models/media";
import { openAlbum } from "../../navigation/navigationHelpers";
import { useBrowseStore } from "../../store/useBrowseStore";
import { authColors, authRadii, authSpacing } from "../../theme/authTheme";
import { AuthGradientBackground } from "../auth/AuthGradientBackground";
import { CachedCover } from "../ui/CachedCover";

interface ArtistDetailScreenProps {
  artistId: string;
}

const ALBUM_ROW_HEIGHT = 88;

function ArtistAlbumRow({
  album,
  onPress,
}: {
  album: Album;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.albumRow}>
      <CachedCover
        uri={album.coverArtUrl}
        size={64}
        borderRadius={authRadii.sm}
      />
      <View style={styles.albumMeta}>
        <Text style={styles.albumTitle} numberOfLines={1}>
          {album.title}
        </Text>
        <Text style={styles.albumSub} numberOfLines={1}>
          {album.year ? `${album.year} · ` : ""}
          {album.songCount} songs
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={authColors.textMuted} />
    </Pressable>
  );
}

export function ArtistDetailScreen({ artistId }: ArtistDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadArtist = useBrowseStore((s) => s.loadArtist);
  const entry = useBrowseStore((s) => s.artistById[artistId]);
  const isLoading = useBrowseStore((s) => s.loadingArtistId === artistId);
  const lastError = useBrowseStore((s) => s.lastError);

  useEffect(() => {
    loadArtist(artistId).catch(() => undefined);
  }, [artistId, loadArtist]);

  const artist = entry?.artist;
  const albums = entry?.albums ?? [];

  const renderAlbum = useCallback(
    ({ item }: { item: Album }) => (
      <ArtistAlbumRow album={item} onPress={() => openAlbum(router, item.id)} />
    ),
    [router],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.hero}>
        {artist ? (
          <>
            <CachedCover
              uri={artist.coverArtUrl}
              size={180}
              borderRadius={90}
              style={styles.avatar}
            />
            <Text style={styles.name}>{artist.name}</Text>
            <Text style={styles.meta}>{artist.albumCount} albums</Text>
          </>
        ) : null}
        {isLoading ? (
          <ActivityIndicator color={authColors.accent} style={styles.loader} />
        ) : null}
        {lastError && !artist ? (
          <Text style={styles.error}>{lastError}</Text>
        ) : null}
        <Text style={styles.section}>Albums</Text>
      </View>
    ),
    [artist, isLoading, lastError],
  );

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
          data={albums}
          keyExtractor={(item) => item.id}
          renderItem={renderAlbum}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={7}
          getItemLayout={(_, index) => ({
            length: ALBUM_ROW_HEIGHT,
            offset: ALBUM_ROW_HEIGHT * index,
            index,
          })}
          ListEmptyComponent={
            !isLoading && artist ? (
              <Text style={styles.empty}>No albums for this artist.</Text>
            ) : null
          }
        />
      </View>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: {
    paddingHorizontal: authSpacing.lg,
    paddingVertical: authSpacing.sm,
  },
  hero: {
    paddingHorizontal: authSpacing.lg,
    paddingBottom: authSpacing.sm,
  },
  avatar: {
    alignSelf: "center",
    marginBottom: authSpacing.md,
  },
  name: {
    color: authColors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  meta: {
    color: authColors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: authSpacing.md,
  },
  section: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  albumRow: {
    height: ALBUM_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: authSpacing.lg,
  },
  albumMeta: {
    flex: 1,
    marginLeft: authSpacing.md,
    marginRight: authSpacing.sm,
  },
  albumTitle: {
    color: authColors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  albumSub: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  loader: { marginVertical: authSpacing.lg },
  error: {
    color: authColors.danger,
    textAlign: "center",
    marginTop: authSpacing.md,
  },
  empty: {
    color: authColors.textSecondary,
    textAlign: "center",
    padding: authSpacing.lg,
  },
});
