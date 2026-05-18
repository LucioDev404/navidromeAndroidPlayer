import type { Album, Artist, Genre, Playlist, Song } from "../models/media";
import type { SubsonicClient } from "../subsonic/client/SubsonicClient";
import type {
  SubsonicAlbum,
  SubsonicArtist,
  SubsonicGenre,
  SubsonicPlaylist,
  SubsonicSong,
} from "../subsonic/models/responses";

function coverUrl(
  client: SubsonicClient,
  coverArtId?: string,
  size = 300,
): string | undefined {
  if (!coverArtId) {
    return undefined;
  }
  return client.getCoverArtUrl(coverArtId, size);
}

export const SubsonicMappers = {
  mapAlbum(
    client: SubsonicClient,
    raw: SubsonicAlbum | undefined,
  ): Album | null {
    if (!raw?.id || !raw.name) {
      return null;
    }

    return {
      id: raw.id,
      title: raw.name,
      artist: raw.artist ?? "Unknown Artist",
      artistId: raw.artistId ?? "",
      coverArtUrl: coverUrl(client, raw.coverArt, 320),
      year: raw.year,
      genre: raw.genre,
      songCount: raw.songCount ?? 0,
      duration: raw.duration ?? 0,
    };
  },

  mapArtist(
    client: SubsonicClient,
    raw: SubsonicArtist | undefined,
  ): Artist | null {
    if (!raw?.id || !raw.name) {
      return null;
    }

    return {
      id: raw.id,
      name: raw.name,
      albumCount: raw.albumCount ?? 0,
      coverArtUrl: coverUrl(client, raw.id, 320),
    };
  },

  mapSong(client: SubsonicClient, raw: SubsonicSong | undefined): Song | null {
    if (!raw?.id || !raw.title) {
      return null;
    }

    return {
      id: raw.id,
      title: raw.title,
      artist: raw.artist ?? "Unknown Artist",
      artistId: raw.artistId ?? "",
      album: raw.album ?? "Unknown Album",
      albumId: raw.albumId ?? "",
      track: raw.track ?? 0,
      duration: raw.duration ?? 0,
      year: raw.year,
      genre: raw.genre,
      coverArtUrl: coverUrl(client, raw.coverArt ?? raw.albumId, 320),
    };
  },

  mapPlaylist(
    client: SubsonicClient,
    raw: SubsonicPlaylist | undefined,
  ): Playlist | null {
    if (!raw?.id || !raw.name) {
      return null;
    }

    return {
      id: raw.id,
      name: raw.name,
      songCount: raw.songCount ?? 0,
      duration: raw.duration ?? 0,
      coverArtUrl: coverUrl(client, raw.coverArt, 320),
      isPublic: raw.public ?? false,
    };
  },

  mapGenre(raw: SubsonicGenre | undefined): Genre | null {
    if (!raw?.value) {
      return null;
    }

    return {
      name: raw.value,
      songCount: raw.songCount ?? 0,
      albumCount: raw.albumCount ?? 0,
    };
  },

  mapAlbums(client: SubsonicClient, raw: SubsonicAlbum[] | undefined): Album[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set<string>();
    const albums: Album[] = [];
    for (const item of raw) {
      const mapped = this.mapAlbum(client, item);
      if (mapped && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        albums.push(mapped);
      }
    }
    return albums;
  },

  mapArtists(
    client: SubsonicClient,
    raw: SubsonicArtist[] | undefined,
  ): Artist[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set<string>();
    const artists: Artist[] = [];
    for (const item of raw) {
      const mapped = this.mapArtist(client, item);
      if (mapped && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        artists.push(mapped);
      }
    }
    return artists;
  },

  mapSongs(client: SubsonicClient, raw: SubsonicSong[] | undefined): Song[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const seen = new Set<string>();
    const songs: Song[] = [];
    for (const item of raw) {
      const mapped = this.mapSong(client, item);
      if (mapped && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        songs.push(mapped);
      }
    }
    return songs;
  },

  mapPlaylists(
    client: SubsonicClient,
    raw: SubsonicPlaylist[] | undefined,
  ): Playlist[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw
      .map((item) => this.mapPlaylist(client, item))
      .filter((item): item is Playlist => item !== null);
  },

  mapGenres(raw: SubsonicGenre[] | undefined): Genre[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw
      .map((item) => this.mapGenre(item))
      .filter((item): item is Genre => item !== null);
  },
};

export default SubsonicMappers;
