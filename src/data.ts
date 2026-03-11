import { Photo, Album, PhotoEdits } from './types';

const defaultEdits: PhotoEdits = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 100,
  highlights: 0,
  shadows: 0,
  warmth: 0,
  rotation: 0,
  flipX: false,
  flipY: false,
};

export const generateMockPhotos = (count: number): Photo[] => {
  // Return empty array to ensure full offline capability
  // Users can upload their own photos which will be saved to IndexedDB
  return [];
};

export const initialAlbums: Album[] = [
  { id: 'recents', title: 'Recents', system: true },
  { id: 'favorites', title: 'Favorites', system: true },
  { id: 'vacation', title: 'Summer Vacation', system: false },
  { id: 'family', title: 'Family', system: false },
];
