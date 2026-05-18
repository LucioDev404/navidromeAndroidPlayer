import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthTextField({
  label,
  error,
  style,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={authColors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        autoCapitalize="none"
        autoCorrect={false}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: authSpacing.md,
  },
  label: {
    color: authColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: authSpacing.xs,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: authColors.surface,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: authRadii.md,
    color: authColors.textPrimary,
    fontSize: 16,
    paddingHorizontal: authSpacing.md,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: authColors.danger,
  },
  error: {
    color: authColors.danger,
    fontSize: 12,
    marginTop: authSpacing.xs,
  },
});
