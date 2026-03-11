/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GalleryProvider, useGallery } from './context';
import { BottomNav } from './components/BottomNav';
import { PhotoGrid } from './components/PhotoGrid';
import { PhotoViewer } from './components/PhotoViewer';
import { PhotoEditor } from './components/PhotoEditor';
import { Albums } from './components/Albums';
import { Search } from './components/Search';
import { ForYou } from './components/ForYou';
import { Setup } from './components/Setup';
import { Photo } from './types';
import { AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

function GalleryApp() {
  const [setupComplete, setSetupComplete] = useState(() => {
    return localStorage.getItem('gallery_setup_complete') === 'true';
  });
  const [activeTab, setActiveTab] = useState('library');
  const { photos, addPhotos, isLoading } = useGallery();
  
  const [viewingPhoto, setViewingPhoto] = useState<{ photo: Photo; index: number } | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setViewingPhoto({ photo, index });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const generateVideoThumbnail = (file: File): Promise<{thumbnailUrl: string, duration: number}> => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;
        
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration / 2); // Seek to 1s or middle
        };
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve({thumbnailUrl: canvas.toDataURL('image/jpeg', 0.7), duration: video.duration});
          } else {
            resolve({thumbnailUrl: video.src, duration: video.duration});
          }
          URL.revokeObjectURL(video.src);
        };
        
        video.onerror = () => {
          resolve({thumbnailUrl: video.src, duration: 0});
        };
      });
    };

    const newPhotosPromises = Array.from(files).map(async (file: File, index) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      
      let thumbnailUrl = url;
      let duration = 0;
      
      if (isVideo) {
        const result = await generateVideoThumbnail(file);
        thumbnailUrl = result.thumbnailUrl;
        duration = result.duration;
      }

      return {
        id: `local-${Date.now()}-${index}`,
        url,
        thumbnailUrl,
        type: isVideo ? 'video' : 'photo',
        date: new Date().toISOString(),
        isFavorite: false,
        width: 1080, // Default width
        height: 1920,
        file,
        duration: isVideo ? duration : undefined,
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
      } as Photo;
    });

    const newPhotos = await Promise.all(newPhotosPromises);
    addPhotos(newPhotos);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-violet-500/30">
      {!setupComplete && <Setup onComplete={() => setSetupComplete(true)} />}
      
      {/* Hidden file input for native mobile photo picker */}
      <input 
        type="file" 
        accept="image/*,video/*" 
        multiple 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      {/* Main Content Area */}
      <main className="h-full w-full overflow-y-auto overflow-x-hidden pb-safe">
        {activeTab === 'library' && (
          <>
            <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 pt-safe">
              <div className="flex justify-between items-center px-4 h-14">
                <h1 className="text-xl font-bold tracking-tight">Library</h1>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-violet-500 p-1"
                    aria-label="Add photos"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                  <button className="text-violet-500 font-medium text-sm">Select</button>
                </div>
              </div>
            </div>
            <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />
          </>
        )}
        {activeTab === 'foryou' && <ForYou onPhotoClick={handlePhotoClick} />}
        {activeTab === 'albums' && <Albums />}
        {activeTab === 'search' && <Search onPhotoClick={handlePhotoClick} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Overlays */}
      <AnimatePresence>
        {viewingPhoto && !editingPhoto && (
          <PhotoViewer
            initialIndex={viewingPhoto.index}
            photos={photos}
            onClose={() => setViewingPhoto(null)}
            onEdit={(photo) => setEditingPhoto(photo)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPhoto && (
          <PhotoEditor
            photo={editingPhoto}
            onClose={() => setEditingPhoto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GalleryProvider>
      <GalleryApp />
    </GalleryProvider>
  );
}
