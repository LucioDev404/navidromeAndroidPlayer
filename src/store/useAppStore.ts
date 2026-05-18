import create from "zustand";

interface AppState {
  isAuthenticated: boolean;
  username: string;
  serverUrl: string;
  login: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  username: "",
  serverUrl: "",
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
