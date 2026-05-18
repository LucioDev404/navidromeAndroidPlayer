import { SubsonicMappers } from "../../mappers/subsonic";
import type { Album, Artist, Playlist, Song } from "../../models/media";
import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import type {
  SubsonicAlbum,
  SubsonicArtist,
  SubsonicPlaylist,
  SubsonicSong,
} from "../models/responses";
import { asArray } from "../utils/parse";

const mappers = SubsonicMappers;

export async function fetchArtist(
  client: SubsonicClient,
  id: string,
): Promise<{ artist: Artist; albums: Album[] } | null> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getArtist,
    { id },
  );

  const artistRaw = payload.artist as SubsonicArtist | undefined;
  const artist = mappers.mapArtist(client, artistRaw);
  if (!artist) {
    return null;
  }

  const albumsRaw = asArray(
    (artistRaw as { album?: SubsonicAlbum | SubsonicAlbum[] } | undefined)
      ?.album,
  );
  return {
    artist,
    albums: mappers.mapAlbums(client, albumsRaw),
  };
}

export async function fetchAlbum(
  client: SubsonicClient,
  id: string,
): Promise<{ album: Album; songs: Song[] } | null> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getAlbum,
    { id },
  );

  const albumRaw = payload.album as
    | (SubsonicAlbum & { song?: SubsonicSong | SubsonicSong[] })
    | undefined;
  const album = mappers.mapAlbum(client, albumRaw);
  if (!album) {
    return null;
  }

  const songsRaw = asArray(albumRaw?.song);
  return {
    album,
    songs: mappers.mapSongs(client, songsRaw),
  };
}

export async function fetchSong(
  client: SubsonicClient,
  id: string,
): Promise<Song | null> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getSong,
    {
      id,
    },
  );

  const songRaw = payload.song as SubsonicSong | undefined;
  return mappers.mapSong(client, songRaw);
}

export async function fetchPlaylist(
  client: SubsonicClient,
  id: string,
): Promise<{ playlist: Playlist; songs: Song[] } | null> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getPlaylist,
    { id },
  );

  const playlistRaw = payload.playlist as
    | (SubsonicPlaylist & { entry?: SubsonicSong | SubsonicSong[] })
    | undefined;
  const playlist = mappers.mapPlaylist(client, playlistRaw);
  if (!playlist) {
    return null;
  }

  const songsRaw = asArray(playlistRaw?.entry);
  return {
    playlist,
    songs: mappers.mapSongs(client, songsRaw),
  };
}
