import { Pressable, StyleSheet, Text, View } from "react-native";

import type { NavidromeEndpoint } from "../../api/subsonic/models/types";
import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

interface AccountCardProps {
  endpoint: NavidromeEndpoint;
  isActive: boolean;
  onPress: () => void;
  onRemove?: () => void;
}

function formatLastUsed(iso?: string): string {
  if (!iso) {
    return "Never used";
  }
  try {
    return `Last used ${new Date(iso).toLocaleString()}`;
  } catch {
    return "Last used recently";
  }
}

export function AccountCard({
  endpoint,
  isActive,
  onPress,
  onRemove,
}: AccountCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isActive ? styles.cardActive : null,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{endpoint.label}</Text>
        {isActive ? <Text style={styles.badge}>ACTIVE</Text> : null}
      </View>
      <Text style={styles.url} numberOfLines={1}>
        {endpoint.baseUrl}
      </Text>
      <Text style={styles.meta}>{endpoint.username}</Text>
      <Text style={styles.meta}>
        {formatLastUsed(endpoint.lastConnectedAt)}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          hitSlop={8}
          style={styles.removeButton}
        >
          <Text style={styles.removeLabel}>Remove</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: authColors.surface,
    borderRadius: authRadii.lg,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    marginBottom: authSpacing.sm,
  },
  cardActive: {
    borderColor: authColors.accent,
    backgroundColor: "rgba(29, 185, 84, 0.08)",
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: authColors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  badge: {
    color: authColors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  url: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  meta: {
    color: authColors.textMuted,
    fontSize: 12,
  },
  removeButton: {
    marginTop: authSpacing.sm,
    alignSelf: "flex-start",
  },
  removeLabel: {
    color: authColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
});
