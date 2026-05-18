/**
 * Complete Subsonic/Navidrome API response models
 * Typed for correctness and type safety
 */

/* ===== BASIC TYPES ===== */

export interface SubsonicArtist {
  id: string;
  name: string;
  albumCount?: number;
  starred?: boolean;
}

export interface SubsonicAlbum {
  id: string;
  name: string;
  artist?: string;
  artistId?: string;
  coverArt?: string;
  songCount?: number;
  duration?: number;
  created?: string;
  year?: number;
  genre?: string;
  starred?: boolean;
  userRating?: number;
}

export interface SubsonicSong {
  id: string;
  title: string;
  album?: string;
  albumId?: string;
  artist?: string;
  artistId?: string;
  track?: number;
  duration?: number;
  coverArt?: string;
  created?: string;
  year?: number;
  genre?: string;
  starred?: boolean;
  userRating?: number;
  bitRate?: number;
  size?: number;
  suffix?: string;
  contentType?: string;
  path?: string;
}

export interface SubsonicPlaylist {
  id: string;
  name: string;
  comment?: string;
  songCount?: number;
  duration?: number;
  created?: string;
  changed?: string;
  owner?: string;
  public?: boolean;
  coverArt?: string;
}

export interface SubsonicGenre {
  value: string;
  songCount?: number;
  albumCount?: number;
}

export interface SubsonicUser {
  username: string;
  email?: string;
  scrobblingEnabled?: boolean;
  adminRole?: boolean;
  settingsRole?: boolean;
  downloadRole?: boolean;
  uploadRole?: boolean;
  playlistRole?: boolean;
  coverArtRole?: boolean;
  commentRole?: boolean;
  podcastRole?: boolean;
  streamRole?: boolean;
  jukeboxRole?: boolean;
  shareRole?: boolean;
}

/* ===== API RESPONSE ENVELOPES ===== */

export interface SubsonicPingResponse {
  status: "ok" | "failed";
  version: string;
  type?: string;
}

export interface SubsonicIndexesResponse {
  status: "ok" | "failed";
  ignoredArticles?: string;
  index?: SubsonicIndex[];
}

export interface SubsonicIndex {
  name: string;
  artist?: SubsonicArtist[];
}

export interface SubsonicArtistsResponse {
  status: "ok" | "failed";
  ignoredArticles?: string;
  index?: SubsonicIndex[];
}

export interface SubsonicArtistResponse {
  status: "ok" | "failed";
  artist?: SubsonicArtistDetail;
}

export interface SubsonicArtistDetail extends SubsonicArtist {
  album?: SubsonicAlbum[];
  biography?: string;
  musicBrainzId?: string;
  lastFmUrl?: string;
  smallImageUrl?: string;
  mediumImageUrl?: string;
  largeImageUrl?: string;
}

export interface SubsonicAlbumResponse {
  status: "ok" | "failed";
  album?: SubsonicAlbumDetail;
}

export interface SubsonicAlbumDetail extends SubsonicAlbum {
  song?: SubsonicSong[];
}

export interface SubsonicAlbumListResponse {
  status: "ok" | "failed";
  albumList?: { album?: SubsonicAlbum[] } | null;
  albumList2?: { album?: SubsonicAlbum[] } | null;
}

export interface SubsonicSongResponse {
  status: "ok" | "failed";
  song?: SubsonicSong;
}

export interface SubsonicPlaylistsResponse {
  status: "ok" | "failed";
  playlists?: { playlist?: SubsonicPlaylist[] } | null;
}

export interface SubsonicPlaylistResponse {
  status: "ok" | "failed";
  playlist?: SubsonicPlaylistDetail;
}

export interface SubsonicPlaylistDetail extends SubsonicPlaylist {
  entry?: SubsonicSong[];
}

export interface SubsonicGenresResponse {
  status: "ok" | "failed";
  genres?: { genre?: SubsonicGenre[] } | null;
}

export interface SubsonicSearchResponse {
  status: "ok" | "failed";
  searchResult2?: {
    artist?: SubsonicArtist[];
    album?: SubsonicAlbum[];
    song?: SubsonicSong[];
  };
}

export interface SubsonicUserResponse {
  status: "ok" | "failed";
  user?: SubsonicUser;
}

export interface SubsonicRandomSongsResponse {
  status: "ok" | "failed";
  randomSongs?: { song?: SubsonicSong[] } | null;
}

export interface SubsonicStarredResponse {
  status: "ok" | "failed";
  starred2?: {
    artist?: SubsonicArtist[];
    album?: SubsonicAlbum[];
    song?: SubsonicSong[];
  };
}

export interface SubsonicNowPlayingResponse {
  status: "ok" | "failed";
  nowPlaying?: { entry?: SubsonicSong[] } | null;
}
