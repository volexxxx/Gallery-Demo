import React from 'react';
import { useGallery } from '../context';
import { ChevronRight, Plus } from 'lucide-react';

export const Albums: React.FC = () => {
  const { albums, photos } = useGallery();

  return (
    <div className="pb-24 pt-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Albums</h1>
        <button className="text-violet-500 p-2">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {albums.map((album) => {
          const albumPhotos = album.id === 'recents' 
            ? photos 
            : album.id === 'favorites' 
              ? photos.filter(p => p.isFavorite) 
              : photos.filter(p => p.albumId === album.id);
          
          const coverPhoto = albumPhotos[0];

          return (
            <div key={album.id} className="flex flex-col cursor-pointer group">
              <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-2 relative shadow-sm group-active:scale-95 transition-transform">
                {coverPhoto ? (
                  <img 
                    src={coverPhoto.thumbnailUrl} 
                    alt={album.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <span className="text-sm font-medium">Empty</span>
                  </div>
                )}
                {album.id === 'favorites' && (
                  <div className="absolute bottom-2 left-2">
                    <svg className="w-5 h-5 text-white drop-shadow-md fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {album.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {albumPhotos.length}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Media Types</h2>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
          {['Videos', 'Selfies', 'Live Photos', 'Portraits', 'Panoramas'].map((type, i, arr) => (
            <div 
              key={type} 
              className={`flex justify-between items-center p-4 ${i !== arr.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-violet-500 w-6 flex justify-center">
                  {/* Placeholder icon */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-zinc-900 dark:text-white font-medium">{type}</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-400">
                <span className="text-sm">0</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
