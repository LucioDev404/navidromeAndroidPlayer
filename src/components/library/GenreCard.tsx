import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authColors, authSpacing } from "../../theme/authTheme";
import { genreGradient } from "../../utils/genreColors";
import { CachedCover } from "../ui/CachedCover";

interface GenreCardProps {
  name: string;
  songCount?: number;
  albumCount?: number;
  coverUrl?: string;
  onPress?: () => void;
}

export function GenreCard({
  name,
  songCount,
  albumCount,
  coverUrl,
  onPress,
}: GenreCardProps) {
  const colors = genreGradient(name);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      android_ripple={{ color: "rgba(255,255,255,0.14)" }}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Open ${name}` : undefined}
    >
      <LinearGradient colors={colors} style={styles.gradient}>
        <View style={styles.inner}>
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {songCount ?? 0} songs · {albumCount ?? 0} albums
            </Text>
          </View>
          <CachedCover uri={coverUrl} size={56} borderRadius={12} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    borderRadius: authSpacing.lg,
    overflow: "hidden",
    backgroundColor: authColors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.18,
  },
  gradient: {
    flex: 1,
    padding: authSpacing.md,
    justifyContent: "flex-end",
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  textBlock: {
    flex: 1,
    paddingRight: authSpacing.sm,
  },
  title: {
    color: authColors.surface,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  subtitle: {
    color: authColors.surface,
    opacity: 0.9,
    fontSize: 12,
  },
});

export default memo(GenreCard);
