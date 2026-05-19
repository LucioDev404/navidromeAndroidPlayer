import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { appInfo } from "../../config/appInfo";
import { authColors, authSpacing } from "../../theme/authTheme";

interface AppInfoCardProps {
  serverLabel?: string;
  serverUrl?: string;
}

function AppInfoCardComponent({ serverLabel, serverUrl }: AppInfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>App</Text>
      <InfoRow label="Version" value={`v${appInfo.version}`} />
      <InfoRow label="Build" value={appInfo.buildNumber} />
      <InfoRow label="Environment" value={appInfo.environment} />
      <InfoRow label="Platform" value={appInfo.platform} />
      <InfoRow label="Playback engine" value={appInfo.playbackEngine} />
      {serverLabel ? (
        <InfoRow label="Active server" value={serverLabel} />
      ) : null}
      {serverUrl ? (
        <InfoRow label="Server URL" value={serverUrl} muted />
      ) : null}
    </View>
  );
}

function InfoRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, muted && styles.valueMuted]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: authColors.surface,
    borderRadius: 14,
    padding: authSpacing.md,
    borderWidth: 1,
    borderColor: authColors.border,
    marginTop: authSpacing.md,
  },
  heading: {
    color: authColors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: authSpacing.md,
    paddingVertical: 6,
  },
  label: {
    color: authColors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  value: {
    color: authColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    flex: 1.2,
    textAlign: "right",
  },
  valueMuted: {
    fontWeight: "400",
    fontSize: 12,
  },
});

export const AppInfoCard = memo(AppInfoCardComponent);
