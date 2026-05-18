import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Song } from "../../api/models/media";
import { authColors, authSpacing } from "../../theme/authTheme";

interface TrackRowProps {
  song: Song;
  index: number;
  isActive: boolean;
  onPress: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function TrackRowComponent({ song, index, isActive, onPress }: TrackRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, isActive && styles.rowActive]}
    >
      <Text style={[styles.index, isActive && styles.indexActive]}>
        {index + 1}
      </Text>
      <View style={styles.meta}>
        <Text
          style={[styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
      {isActive ? (
        <Ionicons
          name="volume-medium"
          size={16}
          color={authColors.accent}
          style={styles.icon}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.lg,
  },
  rowActive: {
    backgroundColor: "rgba(29,185,84,0.1)",
  },
  index: {
    width: 28,
    color: authColors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  indexActive: {
    color: authColors.accent,
  },
  meta: {
    flex: 1,
    marginRight: authSpacing.sm,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  titleActive: {
    color: authColors.accent,
  },
  artist: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    color: authColors.textMuted,
    fontSize: 12,
    marginRight: authSpacing.xs,
  },
  icon: {
    marginLeft: 4,
  },
});

export const TrackRow = memo(TrackRowComponent);
