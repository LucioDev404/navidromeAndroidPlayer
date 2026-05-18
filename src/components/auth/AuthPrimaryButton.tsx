import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
}

export function AuthPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#000000" : authColors.textPrimary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "primary" ? styles.labelPrimary : styles.labelSecondary,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: authRadii.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: authSpacing.sm,
  },
  primary: {
    backgroundColor: authColors.accent,
  },
  secondary: {
    backgroundColor: authColors.surfaceHighlight,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  danger: {
    backgroundColor: "rgba(233, 20, 41, 0.15)",
    borderWidth: 1,
    borderColor: authColors.danger,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  labelPrimary: {
    color: "#000000",
  },
  labelSecondary: {
    color: authColors.textPrimary,
  },
});
