/**
 * App-level media models (independent of API responses)
 * Clean, typed, normalized for UI consumption
 */

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverArtUrl?: string;
  year?: number;
  genre?: string;
  songCount: number;
  duration: number;
}

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  coverArtUrl?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  track: number;
  duration: number;
  year?: number;
  genre?: string;
  coverArtUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songCount: number;
  duration: number;
  coverArtUrl?: string;
  isPublic: boolean;
}

export interface Genre {
  name: string;
  songCount: number;
  albumCount: number;
}

export interface MediaLibrary {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  playlists: Playlist[];
  genres: Genre[];
  recentlyAdded: Album[];
  randomAlbums: Album[];
  recentlyPlayed: Song[];
}

export interface LibrarySection {
  title: string;
  type: "carousel" | "grid" | "list";
  items: (Album | Artist | Song)[];
  count: number;
}
