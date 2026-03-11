import React, { useMemo } from 'react';
import { Photo } from '../types';
import { format, isSameDay } from 'date-fns';
import { motion } from 'motion/react';

import { cn } from '../utils';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo, index: number) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  // Group photos by date
  const groupedPhotos = useMemo(() => {
    const groups: { date: Date; photos: Photo[] }[] = [];
    
    photos.forEach(photo => {
      const photoDate = new Date(photo.date);
      const existingGroup = groups.find(g => isSameDay(g.date, photoDate));
      
      if (existingGroup) {
        existingGroup.photos.push(photo);
      } else {
        groups.push({ date: photoDate, photos: [photo] });
      }
    });
    
    return groups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [photos]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  let globalIndex = 0;

  return (
    <div className="pb-24 pt-16 px-2">
      {groupedPhotos.map((group, groupIndex) => (
        <div key={group.date.toISOString()} className="mb-6">
          <div className="sticky top-14 z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md py-2 px-2 mb-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {format(group.date, 'MMMM d, yyyy')}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {group.photos.map((photo) => {
              const currentIndex = globalIndex++;
              // Determine span based on orientation
              const isLandscape = photo.width > photo.height;
              const spanClass = isLandscape && Math.random() > 0.7 ? 'col-span-2 row-span-1 aspect-[2/1]' : 'col-span-1 row-span-1 aspect-square';

              return (
                <motion.div
                  layoutId={`photo-${photo.id}`}
                  key={photo.id}
                  className={cn("relative overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800 cursor-pointer shadow-sm", spanClass)}
                  onClick={() => onPhotoClick(photo, currentIndex)}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {photo.isFavorite && (
                    <div className="absolute top-1.5 right-1.5">
                      <svg className="w-4 h-4 text-white drop-shadow-md fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  )}
                  {photo.type === 'video' && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/50 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                      {formatDuration(photo.duration || 0)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
