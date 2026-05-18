export const SUBSONIC_PATHS = {
  ping: "ping.view",
  getLicense: "getLicense.view",
  getArtists: "getArtists.view",
  getArtist: "getArtist.view",
  getAlbum: "getAlbum.view",
  getAlbumList2: "getAlbumList2.view",
  getSong: "getSong.view",
  search3: "search3.view",
  getIndexes: "getIndexes.view",
  getGenres: "getGenres.view",
  getMusicFolders: "getMusicFolders.view",
  stream: "stream.view",
  download: "download.view",
  getCoverArt: "getCoverArt.view",
  getPlaylists: "getPlaylists.view",
  getPlaylist: "getPlaylist.view",
  getUser: "getUser.view",
  getNowPlaying: "getNowPlaying.view",
  getStarred2: "getStarred2.view",
  getRandomSongs: "getRandomSongs.view",
} as const;

export type SubsonicPathKey = keyof typeof SUBSONIC_PATHS;
