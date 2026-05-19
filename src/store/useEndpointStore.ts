import { create } from "zustand";

import { SubsonicClient } from "../api/subsonic/client/SubsonicClient";
import {
  isSubsonicApiError,
  SubsonicApiError,
} from "../api/subsonic/models/errors";
import type {
  CreateEndpointInput,
  EndpointCredentials,
  NavidromeEndpoint,
  UpdateEndpointInput,
} from "../api/subsonic/models/types";
import {
  testExistingEndpoint,
  validateAndTestEndpoint,
} from "../api/subsonic/services/connectionService";
import { resolveAllowInsecure } from "../network/endpointPolicy";
import { safeLog } from "../security/safeLog";
import { isSecureStorageNative } from "../security/secureStorage";
import {
  clearActiveEndpointId,
  deleteEndpointCredentials,
  loadActiveEndpointId,
  loadEndpointCredentials,
  loadEndpointRegistry,
  removeEndpoint as removeEndpointFromStorage,
  saveActiveEndpointId,
  upsertEndpoint,
} from "../storage/endpointRepository";

export type HydrationStatus = "idle" | "loading" | "ready" | "error";
export type SessionStatus =
  | "unknown"
  | "restoring"
  | "authenticated"
  | "unauthenticated";

interface EndpointStoreState {
  hydrationStatus: HydrationStatus;
  hydrationError: string | null;
  sessionRestoreComplete: boolean;
  sessionStatus: SessionStatus;
  endpoints: NavidromeEndpoint[];
  activeEndpointId: string | null;
  isSessionAuthenticated: boolean;
  isConnecting: boolean;
  lastError: string | null;
  sessionWarning: string | null;

  hydrate: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  login: (input: CreateEndpointInput) => Promise<NavidromeEndpoint>;
  addEndpoint: (input: CreateEndpointInput) => Promise<NavidromeEndpoint>;
  updateEndpoint: (
    endpointId: string,
    patch: UpdateEndpointInput,
  ) => Promise<NavidromeEndpoint>;
  removeEndpoint: (endpointId: string) => Promise<void>;
  switchActiveEndpoint: (endpointId: string) => Promise<void>;
  testConnection: (endpointId: string) => Promise<void>;
  logout: () => Promise<void>;
  getActiveEndpoint: () => NavidromeEndpoint | null;
  getActiveClient: () => Promise<SubsonicClient | null>;
}

let hydratePromise: Promise<void> | null = null;

function mapError(error: unknown): string {
  if (isSubsonicApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

async function validateRestoredSessionInBackground(
  endpoint: NavidromeEndpoint,
  credentials: EndpointCredentials,
  set: (partial: Partial<EndpointStoreState>) => void,
): Promise<void> {
  try {
    const ping = await testExistingEndpoint(endpoint, credentials);
    const updated: NavidromeEndpoint = {
      ...endpoint,
      lastConnectedAt: new Date().toISOString(),
      connectionStatus: ping.status === "ok" ? "healthy" : "unhealthy",
    };
    const nextEndpoints = await upsertEndpoint(updated, credentials);
    set({
      endpoints: nextEndpoints,
      sessionWarning: null,
    });
  } catch (error) {
    const message = mapError(error);

    if (
      error instanceof SubsonicApiError &&
      error.code === "INVALID_CREDENTIALS"
    ) {
      await clearActiveEndpointId();
      set({
        activeEndpointId: null,
        isSessionAuthenticated: false,
        sessionStatus: "unauthenticated",
        sessionWarning: null,
        lastError:
          "Saved credentials are no longer valid. Please sign in again.",
      });
      return;
    }

    if (
      error instanceof SubsonicApiError &&
      (error.code === "OFFLINE" ||
        error.code === "SERVER_UNREACHABLE" ||
        error.code === "TIMEOUT")
    ) {
      set({
        sessionWarning:
          "Server unreachable. Showing your library from cache where available.",
      });
      return;
    }

    set({ sessionWarning: message });
  }
}

export const useEndpointStore = create<EndpointStoreState>((set, get) => ({
  hydrationStatus: "idle",
  hydrationError: null,
  sessionRestoreComplete: false,
  sessionStatus: "unknown",
  endpoints: [],
  activeEndpointId: null,
  isSessionAuthenticated: false,
  isConnecting: false,
  lastError: null,
  sessionWarning: null,

  hydrate: async () => {
    if (hydratePromise) {
      return hydratePromise;
    }

    hydratePromise = (async () => {
      set({
        hydrationStatus: "loading",
        hydrationError: null,
        sessionRestoreComplete: false,
        sessionStatus: "unknown",
      });

      try {
        if (!isSecureStorageNative()) {
          safeLog(
            "warn",
            "SecureStore unavailable on web — credentials are kept in memory only for this session",
          );
        }

        const [endpoints, activeEndpointId] = await Promise.all([
          loadEndpointRegistry(),
          loadActiveEndpointId(),
        ]);

        set({
          hydrationStatus: "ready",
          endpoints,
          activeEndpointId,
          isSessionAuthenticated: false,
        });

        await get().restoreSession();
      } catch (error) {
        const message = mapError(error);
        set({
          hydrationStatus: "error",
          hydrationError: message,
          sessionRestoreComplete: true,
          sessionStatus: "unauthenticated",
          isSessionAuthenticated: false,
        });
        safeLog("error", "Endpoint store hydration failed", { message });
      } finally {
        hydratePromise = null;
      }
    })();

    return hydratePromise;
  },

  restoreSession: async () => {
    const { activeEndpointId, endpoints } = get();

    if (!activeEndpointId) {
      set({
        sessionStatus: "unauthenticated",
        isSessionAuthenticated: false,
        sessionRestoreComplete: true,
        sessionWarning: null,
      });
      return false;
    }

    const endpoint = endpoints.find((item) => item.id === activeEndpointId);
    if (!endpoint) {
      await clearActiveEndpointId();
      set({
        activeEndpointId: null,
        sessionStatus: "unauthenticated",
        isSessionAuthenticated: false,
        sessionRestoreComplete: true,
        sessionWarning: null,
      });
      return false;
    }

    const credentials = await loadEndpointCredentials(activeEndpointId);
    if (!credentials) {
      await clearActiveEndpointId();
      set({
        activeEndpointId: null,
        sessionStatus: "unauthenticated",
        isSessionAuthenticated: false,
        sessionRestoreComplete: true,
        sessionWarning: null,
      });
      return false;
    }

    // Optimistic restore: enter app immediately (Spotify/Plexamp behavior).
    set({
      sessionStatus: "authenticated",
      isSessionAuthenticated: true,
      isConnecting: false,
      sessionRestoreComplete: true,
      lastError: null,
      sessionWarning: null,
    });

    safeLog("info", "Session restored from secure storage", {
      endpointId: endpoint.id,
    });

    validateRestoredSessionInBackground(endpoint, credentials, set).catch(
      () => {
        /* background validation — errors handled inside */
      },
    );

    return true;
  },

  login: async (input) => {
    return get().addEndpoint(input);
  },

  addEndpoint: async (input) => {
    set({ isConnecting: true, lastError: null, sessionWarning: null });

    try {
      const { endpoint, ping } = await validateAndTestEndpoint(input);
      const credentials: EndpointCredentials = {
        username: input.username.trim(),
        password: input.password,
      };

      const endpoints = await upsertEndpoint(endpoint, credentials);
      await saveActiveEndpointId(endpoint.id);

      set({
        endpoints,
        activeEndpointId: endpoint.id,
        isSessionAuthenticated: true,
        sessionStatus: "authenticated",
        sessionRestoreComplete: true,
        isConnecting: false,
        lastError: null,
        sessionWarning: null,
      });

      safeLog("info", "User logged in", {
        endpointId: endpoint.id,
        version: ping.version,
      });

      return endpoint;
    } catch (error) {
      const message = mapError(error);
      set({ isConnecting: false, lastError: message });
      throw error;
    }
  },

  updateEndpoint: async (endpointId, patch) => {
    const current = get().endpoints.find((item) => item.id === endpointId);
    if (!current) {
      throw new Error("Endpoint not found.");
    }

    const credentials =
      (await loadEndpointCredentials(endpointId)) ??
      ({
        username: current.username,
        password: patch.password ?? "",
      } as EndpointCredentials);

    const nextCredentials: EndpointCredentials = {
      username: patch.username?.trim() ?? credentials.username,
      password: patch.password ?? credentials.password,
    };

    const draft: CreateEndpointInput = {
      label: patch.label ?? current.label,
      baseUrl: patch.baseUrl ?? current.baseUrl,
      username: nextCredentials.username,
      password: nextCredentials.password,
    };

    set({ isConnecting: true, lastError: null });

    try {
      const { endpoint, ping } = await validateAndTestEndpoint(draft);
      const updated: NavidromeEndpoint = {
        ...endpoint,
        id: endpointId,
        createdAt: current.createdAt,
      };

      const endpoints = await upsertEndpoint(updated, nextCredentials);

      set({
        endpoints,
        isConnecting: false,
        lastError: null,
        isSessionAuthenticated:
          get().activeEndpointId === endpointId
            ? true
            : get().isSessionAuthenticated,
        sessionStatus:
          get().activeEndpointId === endpointId
            ? "authenticated"
            : get().sessionStatus,
      });

      safeLog("info", "Endpoint updated", {
        endpointId,
        version: ping.version,
      });

      return updated;
    } catch (error) {
      const message = mapError(error);
      set({ isConnecting: false, lastError: message });
      throw error;
    }
  },

  removeEndpoint: async (endpointId) => {
    const endpoints = await removeEndpointFromStorage(endpointId);
    const { activeEndpointId } = get();

    const nextActiveId =
      activeEndpointId === endpointId ? null : activeEndpointId;

    if (activeEndpointId === endpointId) {
      await clearActiveEndpointId();
    }

    set({
      endpoints,
      activeEndpointId: nextActiveId,
      isSessionAuthenticated: Boolean(nextActiveId),
      sessionStatus: nextActiveId ? get().sessionStatus : "unauthenticated",
    });
  },

  switchActiveEndpoint: async (endpointId) => {
    set({ isConnecting: true, lastError: null, sessionWarning: null });

    try {
      const endpoint = get().endpoints.find((item) => item.id === endpointId);
      if (!endpoint) {
        throw new Error("Endpoint not found.");
      }

      const credentials = await loadEndpointCredentials(endpointId);
      if (!credentials) {
        throw new Error("Stored credentials are missing for this endpoint.");
      }

      const ping = await testExistingEndpoint(endpoint, credentials);

      const updated: NavidromeEndpoint = {
        ...endpoint,
        lastConnectedAt: new Date().toISOString(),
        connectionStatus: ping.status === "ok" ? "healthy" : "unhealthy",
      };

      const endpoints = await upsertEndpoint(updated, credentials);
      await saveActiveEndpointId(endpointId);

      set({
        endpoints,
        activeEndpointId: endpointId,
        isSessionAuthenticated: true,
        sessionStatus: "authenticated",
        sessionRestoreComplete: true,
        isConnecting: false,
        lastError: null,
        sessionWarning: null,
      });
    } catch (error) {
      const message = mapError(error);
      set({ isConnecting: false, lastError: message });
      throw error;
    }
  },

  testConnection: async (endpointId) => {
    const endpoint = get().endpoints.find((item) => item.id === endpointId);
    if (!endpoint) {
      throw new Error("Endpoint not found.");
    }

    const credentials = await loadEndpointCredentials(endpointId);
    if (!credentials) {
      throw new Error("Stored credentials are missing for this endpoint.");
    }

    set({ isConnecting: true, lastError: null });

    try {
      const ping = await testExistingEndpoint(endpoint, credentials);
      const updated: NavidromeEndpoint = {
        ...endpoint,
        lastConnectedAt: new Date().toISOString(),
        connectionStatus: ping.status === "ok" ? "healthy" : "unhealthy",
      };

      const endpoints = await upsertEndpoint(updated, credentials);
      set({ endpoints, isConnecting: false, lastError: null });
    } catch (error) {
      const message = mapError(error);
      set({ isConnecting: false, lastError: message });
      throw error;
    }
  },

  logout: async () => {
    await clearActiveEndpointId();
    set({
      activeEndpointId: null,
      isSessionAuthenticated: false,
      sessionStatus: "unauthenticated",
      sessionRestoreComplete: true,
      lastError: null,
      sessionWarning: null,
    });
    safeLog("info", "User logged out");
  },

  getActiveEndpoint: () => {
    const { endpoints, activeEndpointId } = get();
    return endpoints.find((item) => item.id === activeEndpointId) ?? null;
  },

  getActiveClient: async () => {
    const endpoint = get().getActiveEndpoint();
    if (!endpoint || !get().isSessionAuthenticated) {
      return null;
    }

    const credentials = await loadEndpointCredentials(endpoint.id);
    if (!credentials) {
      return null;
    }

    const allowInsecure =
      endpoint.allowInsecureConnection ??
      resolveAllowInsecure(endpoint.baseUrl, undefined);

    return new SubsonicClient({
      baseUrl: endpoint.baseUrl,
      credentials,
      allowInsecure,
    });
  },
}));

export { deleteEndpointCredentials };
