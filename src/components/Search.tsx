import React, { useState } from 'react';
import { useGallery } from '../context';
import { Search as SearchIcon, X } from 'lucide-react';
import { PhotoGrid } from './PhotoGrid';
import { Photo } from '../types';

interface SearchProps {
  onPhotoClick: (photo: Photo, index: number) => void;
}

export const Search: React.FC<SearchProps> = ({ onPhotoClick }) => {
  const { photos } = useGallery();
  const [query, setQuery] = useState('');

  const filteredPhotos = query 
    ? photos.filter(p => p.date.includes(query) || (p.isFavorite && query.toLowerCase() === 'favorites'))
    : [];

  return (
    <div className="pb-24 pt-16 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">Search</h1>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-transparent rounded-xl leading-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent sm:text-sm transition-colors"
          placeholder="Photos, People, Places..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {query ? (
        filteredPhotos.length > 0 ? (
          <div className="-mx-4">
            <PhotoGrid photos={filteredPhotos} onPhotoClick={onPhotoClick} />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No Results</h3>
            <p className="mt-1 text-sm text-zinc-500">Try a different search term.</p>
          </div>
        )
      ) : (
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Moments</h2>
          <div className="grid grid-cols-2 gap-4">
            {['One Year Ago', 'Summer', 'Winter', 'Favorites'].map((moment) => (
              <div key={moment} className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center cursor-pointer">
                <div className="absolute inset-0 bg-black/20 z-10" />
                <span className="relative z-20 text-white font-semibold shadow-sm">{moment}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
