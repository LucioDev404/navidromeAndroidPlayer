import { logger } from "../utils/logger";

type RoutePushTarget =
  | string
  | {
      pathname: string;
      params?: Record<string, string>;
    };

type RouterLike = {
  push: (href: RoutePushTarget) => void;
};

function albumHref(albumId: string): RoutePushTarget {
  return {
    pathname: "/album/[id]",
    params: { id: albumId },
  };
}

function artistHref(artistId: string): RoutePushTarget {
  return {
    pathname: "/artist/[id]",
    params: { id: artistId },
  };
}

function playlistHref(playlistId: string): RoutePushTarget {
  return {
    pathname: "/playlist/[id]",
    params: { id: playlistId },
  };
}

function genreHref(genreName: string): RoutePushTarget {
  return `/genre/${encodeURIComponent(genreName)}`;
}

export function openAlbum(router: RouterLike, albumId: string): void {
  const id = albumId?.trim();
  if (!id) {
    logger.warn("openAlbum: missing album id");
    return;
  }

  logger.debug("nav:openAlbum", { id });
  router.push(albumHref(id));
}

export function openArtist(router: RouterLike, artistId: string): void {
  const id = artistId?.trim();
  if (!id) {
    logger.warn("openArtist: missing artist id");
    return;
  }

  logger.debug("nav:openArtist", { id });
  router.push(artistHref(id));
}

export function openPlaylist(router: RouterLike, playlistId: string): void {
  const id = playlistId?.trim();
  if (!id) {
    logger.warn("openPlaylist: missing playlist id");
    return;
  }

  logger.debug("nav:openPlaylist", { id });
  router.push(playlistHref(id));
}

export function openGenre(router: RouterLike, genreName: string): void {
  const name = genreName?.trim();
  if (!name) {
    logger.warn("openGenre: missing genre name");
    return;
  }

  logger.debug("nav:openGenre", { name });
  router.push(genreHref(name));
}

export function openFullPlayer(router: RouterLike): void {
  logger.debug("nav:openFullPlayer");
  router.push("/player");
}
