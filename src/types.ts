export interface PhotoEdits {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  highlights: number;
  shadows: number;
  warmth: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  date: string; // ISO date string
  isFavorite: boolean;
  albumId?: string;
  edits: PhotoEdits;
  width: number;
  height: number;
  type?: 'photo' | 'video';
  duration?: number;
  file?: Blob;
}

export interface Album {
  id: string;
  title: string;
  coverPhotoId?: string;
  system?: boolean;
}
