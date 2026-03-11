import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useGesture } from '@use-gesture/react';
import { ChevronLeft, Share, Heart, Trash2, Edit3, MoreHorizontal } from 'lucide-react';
import { Photo } from '../types';
import { useGallery } from '../context';
import { cn } from '../utils';
import { VideoPlayer } from './VideoPlayer';

interface PhotoViewerProps {
  initialIndex: number;
  photos: Photo[];
  onClose: () => void;
  onEdit: (photo: Photo) => void;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({ initialIndex, photos, onClose, onEdit }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showUI, setShowUI] = useState(true);
  const { toggleFavorite, deletePhoto } = useGallery();
  
  const currentPhoto = photos[currentIndex];
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const springConfig = { damping: 25, stiffness: 300 };
  const scaleSpring = useSpring(scale, springConfig);
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom and position when photo changes
  useEffect(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [currentIndex, x, y, scale]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => Math.min(photos.length - 1, prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, photos.length]);

  const bind = useGesture({
    onDrag: ({ offset: [dx, dy], active, velocity, direction: [dirX, dirY] }) => {
      if (scale.get() > 1) {
        // Pan when zoomed in
        x.set(dx);
        y.set(dy);
      } else {
        // Swipe to change photo or close
        if (!active) {
          if (Math.abs(dx) > 100 || (velocity[0] > 0.5 && Math.abs(dx) > 20)) {
            if (dirX > 0 && currentIndex > 0) {
              setCurrentIndex(prev => prev - 1);
            } else if (dirX < 0 && currentIndex < photos.length - 1) {
              setCurrentIndex(prev => prev + 1);
            }
          } else if (dy > 150 || (velocity[1] > 0.5 && dy > 50)) {
            onClose();
          }
          x.set(0);
          y.set(0);
          scale.set(1);
        } else {
          // Only allow vertical drag for closing if not zoomed
          if (Math.abs(dy) > Math.abs(dx)) {
             y.set(dy > 0 ? dy : 0);
             x.set(0);
          } else {
             x.set(dx);
             y.set(0);
          }
        }
      }
    },
    onPinch: ({ offset: [d] }) => {
      const newScale = Math.max(1, Math.min(d, 4));
      scale.set(newScale);
      if (newScale === 1) {
        x.set(0);
        y.set(0);
      }
    }
  }, {
    drag: {
      from: () => [x.get(), y.get()],
      rubberband: true,
    },
    pinch: {
      from: () => [scale.get(), 0],
      scaleBounds: { min: 1, max: 4 },
      rubberband: true,
    }
  });

  const handleDelete = () => {
    if (window.confirm('Delete this photo?')) {
      deletePhoto(currentPhoto.id);
      if (photos.length === 1) {
        onClose();
      } else if (currentIndex === photos.length - 1) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Photo',
          url: currentPhoto.url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing not supported on this device');
    }
  };

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col touch-none"
      >
        {/* Top Bar */}
        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 pt-safe bg-gradient-to-b from-black/60 to-transparent"
            >
              <button onClick={onClose} className="p-2 text-white flex items-center">
                <ChevronLeft className="w-6 h-6" />
                <span className="ml-1 text-sm font-medium">Back</span>
              </button>
              <div className="text-white text-xs font-medium">
                {new Date(currentPhoto.date).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'
                })}
              </div>
              {currentPhoto.type !== 'video' ? (
                <button onClick={() => onEdit(currentPhoto)} className="p-2 text-white font-medium text-sm">
                  Edit
                </button>
              ) : (
                <div className="w-10"></div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Container */}
        <div 
          className="flex-1 relative overflow-hidden flex items-center justify-center touch-none"
          {...(currentPhoto.type !== 'video' ? bind() : {})}
        >
          {currentPhoto.type === 'video' ? (
            <VideoPlayer 
              src={currentPhoto.url} 
              showControls={showUI} 
              onToggleControls={() => setShowUI(!showUI)} 
            />
          ) : (
            <motion.img
              ref={imageRef}
              layoutId={`photo-${currentPhoto.id}`}
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt="Full screen"
              onClick={() => setShowUI(!showUI)}
              className="max-w-full max-h-full object-contain origin-center"
              style={{
                x: xSpring,
                y: ySpring,
                scale: scaleSpring,
                filter: `
                  brightness(${currentPhoto.edits.brightness}%)
                  contrast(${currentPhoto.edits.contrast}%)
                  saturate(${currentPhoto.edits.saturation}%)
                  sepia(${currentPhoto.edits.warmth > 0 ? currentPhoto.edits.warmth : 0}%)
                  hue-rotate(${currentPhoto.edits.warmth < 0 ? currentPhoto.edits.warmth * -0.5 : 0}deg)
                `,
                transform: `
                  rotate(${currentPhoto.edits.rotation}deg)
                  scaleX(${currentPhoto.edits.flipX ? -1 : 1})
                  scaleY(${currentPhoto.edits.flipY ? -1 : 1})
                `
              }}
            />
          )}
        </div>

        {/* Bottom Bar */}
        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-20 flex justify-between items-center p-4 pb-safe bg-gradient-to-t from-black/80 to-transparent"
            >
              <button onClick={handleShare} className="p-3 text-white">
                <Share className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(currentPhoto.id); }} 
                className="p-3 text-white"
              >
                <Heart 
                  className={cn("w-6 h-6", currentPhoto.isFavorite && "fill-current text-red-500")} 
                />
              </button>
              <button onClick={handleDelete} className="p-3 text-white">
                <Trash2 className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
