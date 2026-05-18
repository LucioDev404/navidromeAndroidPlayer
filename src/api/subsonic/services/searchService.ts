import { SubsonicMappers } from "../../mappers/subsonic";
import type { Album, Artist, Song } from "../../models/media";
import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import type {
  SubsonicAlbum,
  SubsonicArtist,
  SubsonicSong,
} from "../models/responses";
import { asArray } from "../utils/parse";

const mappers = SubsonicMappers;

export interface SearchResults {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
}

export async function searchLibrary(
  client: SubsonicClient,
  query: string,
  options?: { artistCount?: number; albumCount?: number; songCount?: number },
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { artists: [], albums: [], songs: [] };
  }

  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.search3,
    {
      query: trimmed,
      artistCount: String(options?.artistCount ?? 20),
      albumCount: String(options?.albumCount ?? 20),
      songCount: String(options?.songCount ?? 30),
    },
  );

  const result = payload.searchResult3 as
    | {
        artist?: SubsonicArtist | SubsonicArtist[];
        album?: SubsonicAlbum | SubsonicAlbum[];
        song?: SubsonicSong | SubsonicSong[];
      }
    | undefined;

  return {
    artists: mappers.mapArtists(client, asArray(result?.artist)),
    albums: mappers.mapAlbums(client, asArray(result?.album)),
    songs: mappers.mapSongs(client, asArray(result?.song)),
  };
}
