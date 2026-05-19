import { SubsonicClient } from "../client/SubsonicClient";
import type { EndpointCredentials, SubsonicPingResult } from "../models/types";

export interface PingEndpointOptions {
  allowInsecure?: boolean;
}

export async function pingEndpoint(
  baseUrl: string,
  credentials: EndpointCredentials,
  signal?: AbortSignal,
  options?: PingEndpointOptions,
): Promise<SubsonicPingResult> {
  const client = new SubsonicClient({
    baseUrl,
    credentials,
    allowInsecure: options?.allowInsecure,
  });
  return client.ping(signal);
}
