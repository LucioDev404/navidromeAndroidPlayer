import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

export type LibraryFilter =
  | "all"
  | "albums"
  | "artists"
  | "songs"
  | "playlists"
  | "genres"
  | "recent";

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recent" },
  { key: "albums", label: "Albums" },
  { key: "artists", label: "Artists" },
  { key: "songs", label: "Songs" },
  { key: "playlists", label: "Playlists" },
  { key: "genres", label: "Genres" },
];

interface LibraryFilterChipsProps {
  value: LibraryFilter;
  onChange: (value: LibraryFilter) => void;
}

export function LibraryFilterChips({
  value,
  onChange,
}: LibraryFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onChange(filter.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: authSpacing.lg,
    gap: authSpacing.sm,
    paddingBottom: authSpacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: authRadii.pill,
    backgroundColor: authColors.surfaceHighlight,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "rgba(29,185,84,0.18)",
    borderColor: authColors.accent,
  },
  chipLabel: {
    color: authColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: authColors.accent,
  },
});
