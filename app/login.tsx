import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AllowHttpToggle } from "../src/components/auth/AllowHttpToggle";
import { AuthGradientBackground } from "../src/components/auth/AuthGradientBackground";
import { AuthPrimaryButton } from "../src/components/auth/AuthPrimaryButton";
import { AuthTextField } from "../src/components/auth/AuthTextField";
import { SessionBanner } from "../src/components/auth/SessionBanner";
import { defaultAllowInsecureOptIn } from "../src/network/endpointPolicy";
import { useAppStore } from "../src/store/useAppStore";
import { useAuthLoading, useIsAuthReady } from "../src/store/useAuthStore";
import { useEndpointStore } from "../src/store/useEndpointStore";
import { authColors, authSpacing } from "../src/theme/authTheme";
import {
  hasLoginFormErrors,
  validateLoginForm,
  type LoginFormValues,
} from "../src/utils/validateLoginForm";

const EMPTY_FORM: LoginFormValues = {
  label: "",
  baseUrl: "",
  username: "",
  password: "",
  allowInsecureConnection: true,
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthReady = useIsAuthReady();
  const isLoading = useAuthLoading();
  const lastError = useEndpointStore((s) => s.lastError);
  const login = useEndpointStore((s) => s.login);
  const syncFromEndpointStore = useAppStore((s) => s.syncFromEndpointStore);

  const [form, setForm] = useState<LoginFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const allowHttpTouchedRef = useRef(false);

  useEffect(() => {
    if (allowHttpTouchedRef.current || !form.baseUrl.trim()) {
      return;
    }
    setForm((current) => ({
      ...current,
      allowInsecureConnection: defaultAllowInsecureOptIn(current.baseUrl),
    }));
  }, [form.baseUrl]);

  const updateField = (key: keyof LoginFormValues, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      if (typeof key === "string") {
        delete next[key];
      }
      return next;
    });
  };

  const handleLogin = async () => {
    const errors = validateLoginForm(form);
    if (hasLoginFormErrors(errors)) {
      setFieldErrors(errors as Record<string, string>);
      return;
    }

    try {
      await login({
        label: form.label.trim(),
        baseUrl: form.baseUrl.trim(),
        username: form.username.trim(),
        password: form.password,
        allowInsecureConnection: form.allowInsecureConnection,
      });
      syncFromEndpointStore();
      router.replace("/(tabs)/library");
    } catch {
      // lastError is set in store
    }
  };

  if (!isAuthReady) {
    return null;
  }

  return (
    <AuthGradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + authSpacing.lg,
              paddingBottom: insets.bottom + authSpacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>Navidrome Player</Text>
          <Text style={styles.subtitle}>
            Sign in to your Navidrome server. Credentials are encrypted on this
            device and your session stays active until you log out.
          </Text>

          {lastError ? (
            <SessionBanner message={lastError} variant="error" />
          ) : null}

          <AuthTextField
            label="Server name"
            placeholder="Home NAS"
            value={form.label}
            onChangeText={(value) => updateField("label", value)}
            error={fieldErrors.label}
          />
          <AuthTextField
            label="Server URL"
            placeholder="http://192.168.1.10:4533"
            value={form.baseUrl}
            onChangeText={(value) => updateField("baseUrl", value)}
            error={fieldErrors.baseUrl}
            autoCapitalize="none"
            keyboardType="url"
            textContentType="URL"
          />
          <AllowHttpToggle
            baseUrl={form.baseUrl}
            value={form.allowInsecureConnection}
            onChange={(value) => {
              allowHttpTouchedRef.current = true;
              updateField("allowInsecureConnection", value);
            }}
          />
          <AuthTextField
            label="Username"
            placeholder="your-username"
            value={form.username}
            onChangeText={(value) => updateField("username", value)}
            error={fieldErrors.username}
            textContentType="username"
            autoComplete="username"
          />
          <AuthTextField
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(value) => updateField("password", value)}
            error={fieldErrors.password}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />

          <AuthPrimaryButton
            label="Sign in"
            onPress={() => {
              handleLogin().catch(() => undefined);
            }}
            loading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: authSpacing.lg,
  },
  brand: {
    color: authColors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: authSpacing.xs,
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: authSpacing.lg,
  },
});
