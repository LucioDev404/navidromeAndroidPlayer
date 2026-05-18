import { navidromeFetch } from "../api/navidromeClient";

export interface AuthResponse {
  token: string;
}

export async function authenticate(
  serverUrl: string,
  username: string,
  password: string,
) {
  const query = `?u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}&v=1.16.1&c=ExpoNavidrome`;
  const result = await navidromeFetch<AuthResponse>(`/rest/ping.view${query}`);
  return result;
}
