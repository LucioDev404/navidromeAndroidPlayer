import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountCard } from "../../src/components/auth/AccountCard";
import { AllowHttpToggle } from "../../src/components/auth/AllowHttpToggle";
import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { AuthPrimaryButton } from "../../src/components/auth/AuthPrimaryButton";
import { AuthTextField } from "../../src/components/auth/AuthTextField";
import { SessionBanner } from "../../src/components/auth/SessionBanner";
import { AppInfoCard } from "../../src/components/settings/AppInfoCard";
import { getScrollBottomInset } from "../../src/navigation/layoutMetrics";
import { useAppStore } from "../../src/store/useAppStore";
import {
  useAuthLoading,
  useIsAuthenticated,
} from "../../src/store/useAuthStore";
import { useBrowseStore } from "../../src/store/useBrowseStore";
import { useEndpointStore } from "../../src/store/useEndpointStore";
import useLibraryStore from "../../src/store/useLibraryStore";
import { usePlayerStore } from "../../src/store/usePlayerStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";
import {
  hasLoginFormErrors,
  validateLoginForm,
  type LoginFormValues,
} from "../../src/utils/validateLoginForm";

export default function AccountTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const logout = useAppStore((s) => s.logout);
  const username = useAppStore((s) => s.username);
  const serverLabel = useAppStore((s) => s.serverLabel);
  const serverUrl = useAppStore((s) => s.serverUrl);

  const endpoints = useEndpointStore((s) => s.endpoints);
  const activeEndpointId = useEndpointStore((s) => s.activeEndpointId);
  const lastError = useEndpointStore((s) => s.lastError);
  const sessionWarning = useEndpointStore((s) => s.sessionWarning);
  const addEndpoint = useEndpointStore((s) => s.addEndpoint);
  const switchActiveEndpoint = useEndpointStore((s) => s.switchActiveEndpoint);
  const removeEndpoint = useEndpointStore((s) => s.removeEndpoint);
  const testConnection = useEndpointStore((s) => s.testConnection);
  const syncFromEndpointStore = useAppStore((s) => s.syncFromEndpointStore);
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const clearPlayer = usePlayerStore((s) => s.clear);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentSong));

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<LoginFormValues>({
    label: "",
    baseUrl: "",
    username: "",
    password: "",
    allowInsecureConnection: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) {
    return null;
  }

  const activeEndpoint = endpoints.find((item) => item.id === activeEndpointId);

  const updateField = (key: keyof LoginFormValues, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleAddServer = async () => {
    const errors = validateLoginForm(form);
    if (hasLoginFormErrors(errors)) {
      setFieldErrors(errors as Record<string, string>);
      return;
    }

    try {
      await addEndpoint({
        label: form.label.trim(),
        baseUrl: form.baseUrl.trim(),
        username: form.username.trim(),
        password: form.password,
        allowInsecureConnection: form.allowInsecureConnection,
      });
      syncFromEndpointStore();
      setForm({
        label: "",
        baseUrl: "",
        username: "",
        password: "",
        allowInsecureConnection: true,
      });
      setShowAddForm(false);
      await loadLibrary({ force: true });
    } catch {
      // store sets lastError
    }
  };

  const handleSwitch = async (endpointId: string) => {
    try {
      await switchActiveEndpoint(endpointId);
      syncFromEndpointStore();
      await loadLibrary({ force: true });
      router.replace("/(tabs)/library");
    } catch {
      // store sets lastError
    }
  };

  const handleRemove = (endpointId: string, label: string) => {
    Alert.alert(
      "Remove server",
      `Remove "${label}" and delete saved credentials from this device?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeEndpoint(endpointId)
              .then(() => loadLibrary({ force: true }))
              .catch(() => undefined);
          },
        },
      ],
    );
  };

  return (
    <AuthGradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + authSpacing.md,
            paddingBottom: getScrollBottomInset(insets.bottom, {
              hasMiniPlayer,
            }),
            paddingHorizontal: authSpacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>
            Profile, servers, and app settings.
          </Text>

          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{username || "Signed in"}</Text>
            <Text style={styles.profileMeta}>{serverLabel}</Text>
            <Text style={styles.profileMetaMuted}>{serverUrl}</Text>
            <Text style={styles.connection}>
              Connection: {activeEndpoint?.connectionStatus ?? "unknown"}
            </Text>
          </View>

          {sessionWarning ? <SessionBanner message={sessionWarning} /> : null}
          {lastError ? (
            <SessionBanner message={lastError} variant="error" />
          ) : null}

          <Text style={styles.sectionTitle}>Navidrome servers</Text>
          {endpoints.map((endpoint) => (
            <View key={endpoint.id}>
              <AccountCard
                endpoint={endpoint}
                isActive={endpoint.id === activeEndpointId}
                onPress={() => {
                  handleSwitch(endpoint.id).catch(() => undefined);
                }}
                onRemove={() => handleRemove(endpoint.id, endpoint.label)}
              />
              <AuthPrimaryButton
                label="Test connection"
                variant="secondary"
                loading={isLoading}
                onPress={() => {
                  testConnection(endpoint.id).catch(() => undefined);
                }}
                style={styles.testButton}
              />
            </View>
          ))}

          {showAddForm ? (
            <View style={styles.formBlock}>
              <Text style={styles.sectionTitle}>Add server</Text>
              <AuthTextField
                label="Server name"
                value={form.label}
                onChangeText={(v) => updateField("label", v)}
                error={fieldErrors.label}
              />
              <AuthTextField
                label="Server URL"
                value={form.baseUrl}
                onChangeText={(v) => updateField("baseUrl", v)}
                error={fieldErrors.baseUrl}
                keyboardType="url"
              />
              <AllowHttpToggle
                baseUrl={form.baseUrl}
                value={form.allowInsecureConnection}
                onChange={(value) =>
                  updateField("allowInsecureConnection", value)
                }
              />
              <AuthTextField
                label="Username"
                value={form.username}
                onChangeText={(v) => updateField("username", v)}
                error={fieldErrors.username}
              />
              <AuthTextField
                label="Password"
                value={form.password}
                onChangeText={(v) => updateField("password", v)}
                error={fieldErrors.password}
                secureTextEntry
              />
              <AuthPrimaryButton
                label="Save & connect"
                loading={isLoading}
                onPress={() => {
                  handleAddServer().catch(() => undefined);
                }}
              />
              <AuthPrimaryButton
                label="Cancel"
                variant="secondary"
                onPress={() => setShowAddForm(false)}
              />
            </View>
          ) : (
            <AuthPrimaryButton
              label="Add server"
              variant="secondary"
              onPress={() => setShowAddForm(true)}
            />
          )}

          <View style={styles.settingsBlock}>
            <Text style={styles.sectionTitle}>About</Text>
            <AppInfoCard serverLabel={serverLabel} serverUrl={serverUrl} />
            <Text style={styles.settingsHint}>
              Downloads, lyrics, and advanced playback options are planned for a
              future release.
            </Text>
          </View>

          <View style={styles.logoutBlock}>
            <AuthPrimaryButton
              label="Log out"
              variant="danger"
              onPress={() => {
                logout()
                  .then(() => {
                    useLibraryStore.getState().clear();
                    useBrowseStore.getState().clear();
                    clearPlayer();
                    router.replace("/login");
                  })
                  .catch(() => undefined);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: {
    color: authColors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: authSpacing.xs,
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 14,
    marginBottom: authSpacing.lg,
  },
  profileCard: {
    backgroundColor: authColors.surface,
    borderRadius: 14,
    padding: authSpacing.md,
    marginBottom: authSpacing.md,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  profileName: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  profileMeta: {
    color: authColors.textSecondary,
    marginTop: 4,
  },
  profileMetaMuted: {
    color: authColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  connection: {
    color: authColors.accent,
    fontSize: 12,
    marginTop: authSpacing.sm,
    fontWeight: "600",
  },
  sectionTitle: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.md,
    marginTop: authSpacing.md,
  },
  testButton: {
    marginTop: -4,
    marginBottom: authSpacing.md,
  },
  formBlock: {
    marginTop: authSpacing.md,
  },
  settingsBlock: {
    marginTop: authSpacing.lg,
  },
  settingsHint: {
    color: authColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  logoutBlock: {
    marginTop: authSpacing.xl,
    marginBottom: authSpacing.lg,
  },
});
