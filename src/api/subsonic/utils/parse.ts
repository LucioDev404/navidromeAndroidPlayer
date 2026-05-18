/**
 * Subsonic often returns a single object OR an array for the same field.
 */
export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function pickAlbumList(payload: Record<string, unknown>): unknown[] {
  const albumList2 = payload.albumList2 as { album?: unknown } | undefined;
  const albumList = payload.albumList as { album?: unknown } | undefined;
  return asArray(albumList2?.album ?? albumList?.album);
}

export function pickSongs(
  payload: Record<string, unknown>,
  key: string,
): unknown[] {
  const container = payload[key] as { song?: unknown } | undefined;
  return asArray(container?.song);
}

export function pickPlaylists(payload: Record<string, unknown>): unknown[] {
  const playlists = payload.playlists as { playlist?: unknown } | undefined;
  return asArray(playlists?.playlist);
}

export function pickGenres(payload: Record<string, unknown>): unknown[] {
  const genres = payload.genres as { genre?: unknown } | undefined;
  return asArray(genres?.genre);
}

export function pickArtistsFromIndexes(
  payload: Record<string, unknown>,
): unknown[] {
  const indexes = asArray(payload.index as { artist?: unknown } | undefined);
  const artists: unknown[] = [];
  for (const index of indexes) {
    artists.push(...asArray(index?.artist));
  }
  return artists;
}

export function pickStarredSongs(payload: Record<string, unknown>): unknown[] {
  const starred = payload.starred2 as
    | { song?: unknown; album?: unknown; artist?: unknown }
    | undefined;
  return asArray(starred?.song);
}
