import * as SplashScreen from "expo-splash-screen";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { setupGlobalErrorHandlers } from "./setupErrorHandlers";
import { useAppStore } from "../store/useAppStore";
import { useEndpointStore } from "../store/useEndpointStore";
import { authColors } from "../theme/authTheme";
import { logger } from "../utils/logger";

SplashScreen.preventAutoHideAsync().catch((error) => {
  logger.warn("SplashScreen.preventAutoHideAsync failed", error);
});

export type AppInitStatus = "loading" | "ready" | "error";

interface AppInitializerProps {
  children: ReactNode;
  resetKey?: number;
}

async function runStartupTasks(): Promise<void> {
  setupGlobalErrorHandlers();
  logger.info("Starting secure startup");

  await useEndpointStore.getState().hydrate();
  useAppStore.getState().syncFromEndpointStore();

  useEndpointStore.subscribe((state, prev) => {
    if (
      state.activeEndpointId !== prev.activeEndpointId ||
      state.isSessionAuthenticated !== prev.isSessionAuthenticated ||
      state.endpoints !== prev.endpoints
    ) {
      useAppStore.getState().syncFromEndpointStore();
    }
  });
}

export function AppInitializer({
  children,
  resetKey = 0,
}: AppInitializerProps) {
  const [status, setStatus] = useState<AppInitStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const initialize = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      await runStartupTasks();
      setStatus("ready");
      await SplashScreen.hideAsync();
      logger.info("Secure startup complete");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Startup initialization failed";
      setErrorMessage(message);
      setStatus("error");
      logger.error("App initialization failed", error);
      await SplashScreen.hideAsync().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    initialize().catch((error) => {
      logger.error("initialize unhandled rejection", error);
    });
  }, [initialize, resetKey]);

  if (status === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={authColors.accent} />
        <Text style={styles.loadingText}>Securing your session…</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Startup failed</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            initialize().catch((error) => {
              logger.error("initialize retry unhandled rejection", error);
            });
          }}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: authColors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: authColors.textSecondary,
    marginTop: 16,
    fontSize: 14,
  },
  errorTitle: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorMessage: {
    color: authColors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: authColors.accent,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryLabel: {
    color: "#000000",
    fontWeight: "700",
  },
});
