/**
 * @deprecated Use SubsonicClient via useEndpointStore.getActiveClient() instead.
 */
import { SubsonicClient } from "./subsonic/client/SubsonicClient";
import type { SubsonicResponseEnvelope } from "./subsonic/models/types";

export type NavidromeResponse<T> = SubsonicResponseEnvelope<T>;

export { SubsonicClient };

export async function navidromeFetch<T>(
  _path: string,
  _options: RequestInit = {},
): Promise<T> {
  throw new Error(
    "navidromeFetch is deprecated. Use useEndpointStore.getActiveClient() for authenticated requests.",
  );
}
