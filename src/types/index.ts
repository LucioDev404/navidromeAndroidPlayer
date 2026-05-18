export interface Artist {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
}
