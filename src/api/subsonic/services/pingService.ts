import { SubsonicClient } from "../client/SubsonicClient";
import type { EndpointCredentials, SubsonicPingResult } from "../models/types";

export async function pingEndpoint(
  baseUrl: string,
  credentials: EndpointCredentials,
  signal?: AbortSignal,
): Promise<SubsonicPingResult> {
  const client = new SubsonicClient({ baseUrl, credentials });
  return client.ping(signal);
}
