import { create } from "zustand";

import { useEndpointStore } from "./useEndpointStore";

/**
 * UI-facing session facade. Source of truth: useEndpointStore + SecureStore.
 */
export interface AppState {
  isAuthenticated: boolean;
  username: string;
  serverUrl: string;
  serverLabel: string;
  syncFromEndpointStore: () => void;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  username: "",
  serverUrl: "",
  serverLabel: "",

  syncFromEndpointStore: () => {
    const endpointState = useEndpointStore.getState();
    const active = endpointState.getActiveEndpoint();

    set({
      isAuthenticated: endpointState.isSessionAuthenticated,
      username: active?.username ?? "",
      serverUrl: active?.baseUrl ?? "",
      serverLabel: active?.label ?? "",
    });
  },

  logout: async () => {
    await useEndpointStore.getState().logout();
    set({
      isAuthenticated: false,
      username: "",
      serverUrl: "",
      serverLabel: "",
    });
  },
}));
