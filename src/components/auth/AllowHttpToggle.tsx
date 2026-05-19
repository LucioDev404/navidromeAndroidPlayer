import { memo } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { insecureConnectionWarning } from "../../network/endpointPolicy";
import { authColors, authSpacing } from "../../theme/authTheme";

interface AllowHttpToggleProps {
  baseUrl: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function AllowHttpToggleComponent({
  baseUrl,
  value,
  onChange,
}: AllowHttpToggleProps) {
  const warning = insecureConnectionWarning(baseUrl);

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.row}
        onPress={() => onChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      >
        <View style={styles.textCol}>
          <Text style={styles.label}>Allow HTTP (insecure)</Text>
          <Text style={styles.hint}>
            Required for http:// servers, LAN IPs, and many self-hosted setups.
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: authColors.border, true: authColors.accent }}
          thumbColor={authColors.textPrimary}
        />
      </Pressable>
      {value && warning ? <Text style={styles.warning}>{warning}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: authSpacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: authSpacing.md,
    paddingVertical: authSpacing.xs,
  },
  textCol: {
    flex: 1,
  },
  label: {
    color: authColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    color: authColors.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  warning: {
    color: "#f5a623",
    fontSize: 12,
    lineHeight: 18,
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.xs,
  },
});

export const AllowHttpToggle = memo(AllowHttpToggleComponent);
