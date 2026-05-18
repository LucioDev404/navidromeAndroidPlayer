import { env } from "../config/env";

export interface NavidromeResponse<T> {
  status: string;
  version: string;
  type: string;
  result: T;
}

export async function navidromeFetch<T>(
  path: string,
  options: RequestInit = {},
) {
  const url = `${env.apiBaseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Navidrome request failed: ${response.status} ${payload}`);
  }

  const json = (await response.json()) as NavidromeResponse<T>;
  return json.result;
}
