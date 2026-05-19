import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { authColors, authSpacing } from "../../theme/authTheme";

interface EmptyStateProps {
  title: string;
  body?: string;
}

function EmptyStateComponent({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: authSpacing.xl,
    paddingHorizontal: authSpacing.lg,
    alignItems: "center",
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: authSpacing.xs,
  },
  body: {
    color: authColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 300,
  },
});

export const EmptyState = memo(EmptyStateComponent);
