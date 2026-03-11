import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Photo, Album, PhotoEdits } from './types';
import { initialAlbums } from './data';
import { get, set } from 'idb-keyval';

interface GalleryContextType {
  photos: Photo[];
  albums: Album[];
  deletePhoto: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updatePhotoEdits: (id: string, edits: Partial<PhotoEdits>) => void;
  resetPhotoEdits: (id: string) => void;
  savePhotoCopy: (id: string) => void;
  addPhotos: (newPhotos: Photo[]) => Promise<void>;
  isLoading: boolean;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const storedPhotos: any[] | undefined = await get('gallery_photos');
        if (storedPhotos && storedPhotos.length > 0) {
          const loadedPhotos = storedPhotos.map(sp => {
            if (sp.file) {
              const url = URL.createObjectURL(sp.file);
              return { ...sp, url, thumbnailUrl: url } as Photo;
            }
            return sp as Photo;
          });
          setPhotos(loadedPhotos);
        } else {
          setPhotos([]);
        }
      } catch (e) {
        console.error("Failed to load photos", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotos();
  }, []);

  const saveToIdb = async (newPhotos: Photo[]) => {
    try {
      // We don't want to store the blob URLs in IDB, just the files and metadata
      const toStore = newPhotos.map(p => {
        const { url, thumbnailUrl, ...rest } = p;
        return rest as Photo;
      });
      await set('gallery_photos', toStore);
    } catch (e) {
      console.error("Failed to save photos to IDB", e);
    }
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => {
      const newPhotos = prev.filter(p => p.id !== id);
      saveToIdb(newPhotos);
      return newPhotos;
    });
  };

  const toggleFavorite = (id: string) => {
    setPhotos(prev => {
      const newPhotos = prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
      saveToIdb(newPhotos);
      return newPhotos;
    });
  };

  const updatePhotoEdits = (id: string, edits: Partial<PhotoEdits>) => {
    setPhotos(prev => {
      const newPhotos = prev.map(p => p.id === id ? { ...p, edits: { ...p.edits, ...edits } } : p);
      saveToIdb(newPhotos);
      return newPhotos;
    });
  };

  const resetPhotoEdits = (id: string) => {
    setPhotos(prev => {
      const newPhotos = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            edits: {
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
            }
          };
        }
        return p;
      });
      saveToIdb(newPhotos);
      return newPhotos;
    });
  };

  const savePhotoCopy = (id: string) => {
    setPhotos(prev => {
      const original = prev.find(p => p.id === id);
      if (original) {
        const copy: Photo = {
          ...original,
          id: `${original.id}-copy-${Date.now()}`,
          date: new Date().toISOString(),
        };
        const newPhotos = [copy, ...prev];
        saveToIdb(newPhotos);
        return newPhotos;
      }
      return prev;
    });
  };

  const addPhotos = async (newPhotos: Photo[]) => {
    setPhotos(prev => {
      const updated = [...newPhotos, ...prev];
      saveToIdb(updated);
      return updated;
    });
  };

  return (
    <GalleryContext.Provider value={{
      photos,
      albums,
      deletePhoto,
      toggleFavorite,
      updatePhotoEdits,
      resetPhotoEdits,
      savePhotoCopy,
      addPhotos,
      isLoading
    }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
