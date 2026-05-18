import * as SecureStore from "expo-secure-store";

import type { EndpointCredentials } from "../api/subsonic/models/types";
import { pingEndpoint } from "../api/subsonic/services/pingService";

export interface AuthResponse {
  status: "ok" | "failed";
  version?: string;
  type?: string;
}

export async function authenticate(
  serverUrl: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const credentials: EndpointCredentials = { username, password };
  const result = await pingEndpoint(serverUrl, credentials);
  return result;
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    // Example API call to validate token
    const response = await fetch("https://example.com/validate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Token validation failed", error);
    return false;
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch("https://example.com/refresh", {
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      await SecureStore.setItemAsync("authToken", data.token);
      return data.token;
    }

    return null;
  } catch (error) {
    console.error("Token refresh failed", error);
    return null;
  }
}
