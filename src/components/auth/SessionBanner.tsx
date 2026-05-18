import { StyleSheet, Text, View } from "react-native";

import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

interface SessionBannerProps {
  message: string;
  variant?: "warning" | "error";
}

export function SessionBanner({
  message,
  variant = "warning",
}: SessionBannerProps) {
  return (
    <View
      style={[
        styles.banner,
        variant === "error" ? styles.error : styles.warning,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: authRadii.md,
    padding: authSpacing.md,
    marginBottom: authSpacing.md,
    borderWidth: 1,
  },
  warning: {
    backgroundColor: "rgba(245, 155, 11, 0.12)",
    borderColor: authColors.warning,
  },
  error: {
    backgroundColor: "rgba(233, 20, 41, 0.12)",
    borderColor: authColors.danger,
  },
  text: {
    color: authColors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
});
