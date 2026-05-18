import { safeLog } from "../../../security/safeLog";
import { SubsonicMappers } from "../../mappers/subsonic";
import type { MediaLibrary } from "../../models/media";
import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import type {
  SubsonicAlbum,
  SubsonicArtist,
  SubsonicGenre,
  SubsonicPlaylist,
  SubsonicSong,
} from "../models/responses";
import {
  pickAlbumList,
  pickArtistsFromIndexes,
  pickGenres,
  pickPlaylists,
  pickSongs,
  pickStarredSongs,
} from "../utils/parse";

const mappers = SubsonicMappers;

async function safeRequest<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    safeLog("warn", `Subsonic ${label} failed`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}

export async function fetchAlbumList(
  client: SubsonicClient,
  type: string,
  size = "50",
): Promise<SubsonicAlbum[]> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getAlbumList2,
    { type, size },
  );
  return pickAlbumList(payload) as SubsonicAlbum[];
}

export async function fetchArtists(
  client: SubsonicClient,
): Promise<SubsonicArtist[]> {
  const indexesPayload = await safeRequest(
    "getIndexes",
    () => client.request<Record<string, unknown>>(SUBSONIC_PATHS.getIndexes),
    {},
  );

  const artistsPayload = await safeRequest(
    "getArtists",
    () => client.request<Record<string, unknown>>(SUBSONIC_PATHS.getArtists),
    {},
  );

  const fromIndexes = pickArtistsFromIndexes(
    indexesPayload,
  ) as SubsonicArtist[];
  if (fromIndexes.length > 0) {
    return fromIndexes;
  }

  return pickArtistsFromIndexes(artistsPayload) as SubsonicArtist[];
}

export async function fetchRandomSongs(
  client: SubsonicClient,
  size = "50",
): Promise<SubsonicSong[]> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getRandomSongs,
    { size },
  );
  return pickSongs(payload, "randomSongs") as SubsonicSong[];
}

export async function fetchStarred(client: SubsonicClient): Promise<{
  songs: SubsonicSong[];
  albums: SubsonicAlbum[];
}> {
  const payload = await safeRequest(
    "getStarred2",
    () => client.request<Record<string, unknown>>(SUBSONIC_PATHS.getStarred2),
    {},
  );

  const starred = payload.starred2 as
    | { song?: unknown; album?: unknown }
    | undefined;

  return {
    songs: pickStarredSongs(payload) as SubsonicSong[],
    albums: (starred?.album
      ? Array.isArray(starred.album)
        ? starred.album
        : [starred.album]
      : []) as SubsonicAlbum[],
  };
}

export async function fetchPlaylists(
  client: SubsonicClient,
): Promise<SubsonicPlaylist[]> {
  const payload = await safeRequest(
    "getPlaylists",
    () => client.request<Record<string, unknown>>(SUBSONIC_PATHS.getPlaylists),
    {},
  );
  return pickPlaylists(payload) as SubsonicPlaylist[];
}

export async function fetchGenres(
  client: SubsonicClient,
): Promise<SubsonicGenre[]> {
  const payload = await safeRequest(
    "getGenres",
    () => client.request<Record<string, unknown>>(SUBSONIC_PATHS.getGenres),
    {},
  );
  return pickGenres(payload) as SubsonicGenre[];
}

export async function fetchFullLibrary(
  client: SubsonicClient,
): Promise<MediaLibrary> {
  const [
    newestRaw,
    recentRaw,
    randomRaw,
    frequentRaw,
    artistsRaw,
    playlistsRaw,
    genresRaw,
    starred,
  ] = await Promise.all([
    fetchAlbumList(client, "newest", "40"),
    fetchAlbumList(client, "recent", "40"),
    fetchAlbumList(client, "random", "40"),
    fetchAlbumList(client, "frequent", "40"),
    fetchArtists(client),
    fetchPlaylists(client),
    fetchGenres(client),
    fetchStarred(client),
  ]);

  const albums = mappers.mapAlbums(client, [
    ...newestRaw,
    ...recentRaw,
    ...randomRaw,
    ...frequentRaw,
    ...starred.albums,
  ]);

  const albumById = new Map(albums.map((album) => [album.id, album]));
  const uniqueAlbums = Array.from(albumById.values());

  const randomSongs = await fetchRandomSongs(client, "60");

  const library: MediaLibrary = {
    artists: mappers.mapArtists(client, artistsRaw),
    albums: uniqueAlbums,
    songs: mappers.mapSongs(client, randomSongs),
    playlists: mappers.mapPlaylists(client, playlistsRaw),
    genres: mappers.mapGenres(genresRaw),
    recentlyAdded: mappers.mapAlbums(client, newestRaw),
    randomAlbums: mappers.mapAlbums(client, randomRaw),
    recentlyPlayed: [],
  };

  safeLog("info", "Library loaded from Navidrome", {
    artists: library.artists.length,
    albums: library.albums.length,
    songs: library.songs.length,
    playlists: library.playlists.length,
    genres: library.genres.length,
    recentlyAdded: library.recentlyAdded.length,
    randomAlbums: library.randomAlbums.length,
    recentlyPlayed: library.recentlyPlayed.length,
  });

  return library;
}

export default {
  fetchFullLibrary,
  fetchAlbumList,
  fetchArtists,
  fetchRandomSongs,
  fetchPlaylists,
  fetchGenres,
};
