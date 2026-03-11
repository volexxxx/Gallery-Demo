import React from 'react';
import { useGallery } from '../context';
import { Photo } from '../types';

interface ForYouProps {
  onPhotoClick: (photo: Photo, index: number) => void;
}

export const ForYou: React.FC<ForYouProps> = ({ onPhotoClick }) => {
  const { photos } = useGallery();

  // Get a random subset of photos for "Memories"
  const memories = photos.slice(0, 5);
  const featured = photos.slice(5, 10);

  return (
    <div className="pb-24 pt-16 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">For You</h1>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Memories</h2>
          <button className="text-violet-500 text-sm font-medium">See All</button>
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 space-x-4 pb-4">
          {memories.map((photo, i) => (
            <div 
              key={photo.id} 
              className="relative flex-none w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-md cursor-pointer"
              onClick={() => onPhotoClick(photo, i)}
            >
              <img 
                src={photo.url} 
                alt="Memory" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg leading-tight">
                  {i === 0 ? 'One Year Ago' : i === 1 ? 'Summer Trip' : 'A Day Out'}
                </h3>
                <p className="text-white/80 text-sm">
                  {new Date(photo.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Featured Photos</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {featured.map((photo, i) => (
            <div 
              key={photo.id} 
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => onPhotoClick(photo, i + 5)}
            >
              <img 
                src={photo.thumbnailUrl} 
                alt="Featured" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
