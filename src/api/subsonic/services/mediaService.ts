import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import { buildSubsonicRequestUrl } from "../utils/url";

/**
 * Media URLs include auth query params — treat as secrets in logs.
 */
export function getStreamUrl(client: SubsonicClient, songId: string): string {
  return client.getStreamUrl(songId);
}

export function getCoverArtUrl(
  client: SubsonicClient,
  coverArtId: string,
  size = 300,
): string {
  return client.getCoverArtUrl(coverArtId, size);
}

export function getDownloadUrl(client: SubsonicClient, songId: string): string {
  return buildSubsonicRequestUrl(
    client.getRestBaseUrl(),
    SUBSONIC_PATHS.download,
    {
      ...(client.buildAuthenticatedQuery() as Record<string, string>),
      id: songId,
    },
  );
}
