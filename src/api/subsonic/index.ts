export { SubsonicClient } from "./client/SubsonicClient";
export {
  buildSubsonicAuthParams,
  computeSubsonicToken,
  generateSalt,
  SUBSONIC_API_VERSION,
  SUBSONIC_CLIENT_ID,
} from "./auth/tokenAuth";
export { SubsonicApiError, isSubsonicApiError } from "./models/errors";
export type {
  ConnectionHealthStatus,
  CreateEndpointInput,
  EndpointCredentials,
  NavidromeEndpoint,
  SubsonicPingResult,
  UpdateEndpointInput,
} from "./models/types";
export {
  validateAndTestEndpoint,
  testExistingEndpoint,
} from "./services/connectionService";
export { pingEndpoint } from "./services/pingService";
export { fetchFullLibrary } from "./services/libraryService";
export { searchLibrary } from "./services/searchService";
export type { SearchResults } from "./services/searchService";
export {
  fetchArtist,
  fetchAlbum,
  fetchSong,
  fetchPlaylist,
} from "./services/browseService";
export {
  fetchLicense,
  fetchMusicFolders,
  validateServerHealth,
} from "./services/serverService";
export { fetchCurrentUser } from "./services/userService";
export { fetchNowPlaying } from "./services/recentService";
export {
  getStreamUrl,
  getCoverArtUrl,
  getDownloadUrl,
} from "./services/mediaService";
