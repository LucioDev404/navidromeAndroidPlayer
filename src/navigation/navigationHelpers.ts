type RouterLike = {
  push: (href: string) => void;
};

export function openAlbum(router: RouterLike, albumId: string): void {
  router.push(`/album/${albumId}`);
}

export function openArtist(router: RouterLike, artistId: string): void {
  router.push(`/artist/${artistId}`);
}

export function openFullPlayer(router: RouterLike): void {
  router.push("/player");
}
