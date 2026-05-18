import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";
import type {
  CreateEndpointInput,
  NavidromeEndpoint,
} from "../api/subsonic/models/types";

/*
 * Auth facade built on top of useEndpointStore.
 * Exposes lightweight UI hooks and methods backed by the endpoint store.
 */
interface AuthStoreState {
  isAuthReady: () => boolean;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  getSessionWarning: () => string | null;
  getLastError: () => string | null;
  getActiveEndpoint: () => NavidromeEndpoint | null;
  getSavedEndpoints: () => NavidromeEndpoint[];
  login: (input: CreateEndpointInput) => Promise<NavidromeEndpoint>;
  logout: () => Promise<void>;
  switchAccount: (endpointId: string) => Promise<void>;
  removeAccount: (endpointId: string) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>(() => ({
  isAuthReady: () => {
    const state = useEndpointStore.getState();
    return (
      state.hydrationStatus === "ready" && state.sessionRestoreComplete === true
    );
  },

  isAuthenticated: () => useEndpointStore.getState().isSessionAuthenticated,

  isLoading: () => {
    const state = useEndpointStore.getState();
    return (
      state.hydrationStatus === "loading" ||
      state.sessionStatus === "restoring" ||
      state.isConnecting
    );
  },

  getSessionWarning: () => useEndpointStore.getState().sessionWarning,

  getLastError: () => useEndpointStore.getState().lastError,

  getActiveEndpoint: () => useEndpointStore.getState().getActiveEndpoint(),

  getSavedEndpoints: () => useEndpointStore.getState().endpoints,

  login: (input) => useEndpointStore.getState().login(input),

  logout: () => useEndpointStore.getState().logout(),

  switchAccount: (endpointId) =>
    useEndpointStore.getState().switchActiveEndpoint(endpointId),

  removeAccount: (endpointId) =>
    useEndpointStore.getState().removeEndpoint(endpointId),
}));

/* Reactive hooks for components (subscribe to endpoint store). */
export function useIsAuthReady(): boolean {
  const hydrationStatus = useEndpointStore((s) => s.hydrationStatus);
  const sessionRestoreComplete = useEndpointStore(
    (s) => s.sessionRestoreComplete,
  );
  return hydrationStatus === "ready" && sessionRestoreComplete;
}

export function useIsAuthenticated(): boolean {
  return useEndpointStore((s) => s.isSessionAuthenticated);
}

export function useAuthLoading(): boolean {
  const hydrationStatus = useEndpointStore((s) => s.hydrationStatus);
  const sessionStatus = useEndpointStore((s) => s.sessionStatus);
  const isConnecting = useEndpointStore((s) => s.isConnecting);
  return (
    hydrationStatus === "loading" ||
    sessionStatus === "restoring" ||
    isConnecting
  );
}
