import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Photo, PhotoEdits } from '../types';
import { useGallery } from '../context';
import { Sun, Contrast, Droplet, Aperture, RotateCw, FlipHorizontal, FlipVertical, X, Check, RotateCcw, Thermometer, Moon, SunDim } from 'lucide-react';
import { cn } from '../utils';

interface PhotoEditorProps {
  photo: Photo;
  onClose: () => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ photo, onClose }) => {
  const { updatePhotoEdits, resetPhotoEdits, savePhotoCopy } = useGallery();
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop'>('adjust');
  const [activeTool, setActiveTool] = useState<keyof PhotoEdits>('brightness');
  
  const [localEdits, setLocalEdits] = useState<PhotoEdits>(photo.edits);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalEdits(prev => ({ ...prev, [activeTool]: value }));
  };

  const handleSave = () => {
    updatePhotoEdits(photo.id, localEdits);
    onClose();
  };

  const handleSaveCopy = () => {
    updatePhotoEdits(photo.id, localEdits);
    savePhotoCopy(photo.id);
    onClose();
  };

  const handleReset = () => {
    setLocalEdits({
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
    });
  };

  const tools = [
    { id: 'brightness', icon: Sun, label: 'Brightness', min: 0, max: 200, default: 100 },
    { id: 'contrast', icon: Contrast, label: 'Contrast', min: 0, max: 200, default: 100 },
    { id: 'saturation', icon: Droplet, label: 'Saturation', min: 0, max: 200, default: 100 },
    { id: 'exposure', icon: Aperture, label: 'Exposure', min: 0, max: 200, default: 100 },
    { id: 'highlights', icon: SunDim, label: 'Highlights', min: -100, max: 100, default: 0 },
    { id: 'shadows', icon: Moon, label: 'Shadows', min: -100, max: 100, default: 0 },
    { id: 'warmth', icon: Thermometer, label: 'Warmth', min: -100, max: 100, default: 0 },
  ];

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 pt-safe text-white bg-gradient-to-b from-black/60 to-transparent absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="p-2 text-zinc-300 hover:text-white transition-colors">
          Cancel
        </button>
        <div className="flex space-x-4">
          <button onClick={handleReset} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Revert
          </button>
          <button onClick={handleSave} className="text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors">
            Done
          </button>
        </div>
      </div>

      {/* Image Preview */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 mt-14 mb-32">
        <img
          src={photo.url}
          alt="Edit preview"
          className="max-w-full max-h-full object-contain"
          style={{
            filter: `
              brightness(${localEdits.brightness}%)
              contrast(${localEdits.contrast}%)
              saturate(${localEdits.saturation}%)
              sepia(${localEdits.warmth > 0 ? localEdits.warmth : 0}%)
              hue-rotate(${localEdits.warmth < 0 ? localEdits.warmth * -0.5 : 0}deg)
            `,
            transform: `
              rotate(${localEdits.rotation}deg)
              scaleX(${localEdits.flipX ? -1 : 1})
              scaleY(${localEdits.flipY ? -1 : 1})
            `
          }}
        />
      </div>

      {/* Editor Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pb-safe pt-10">
        
        {/* Active Tool Slider */}
        <div className="px-8 py-4 flex flex-col items-center justify-center h-24">
          {activeTab === 'adjust' && activeToolData && (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="flex items-center justify-between w-full text-xs font-medium text-zinc-400">
                <span>{activeToolData.min}</span>
                <span className="text-white">{Math.round(localEdits[activeTool as keyof PhotoEdits] as number)}</span>
                <span>{activeToolData.max}</span>
              </div>
              <input
                type="range"
                min={activeToolData.min}
                max={activeToolData.max}
                value={localEdits[activeTool as keyof PhotoEdits] as number}
                onChange={handleSliderChange}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>
          )}
          {activeTab === 'crop' && (
            <div className="flex space-x-8 justify-center w-full">
              <button 
                onClick={() => setLocalEdits(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                className="p-3 bg-zinc-800/80 backdrop-blur-md rounded-full text-white hover:bg-zinc-700 transition-colors"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setLocalEdits(prev => ({ ...prev, flipX: !prev.flipX }))}
                className={cn("p-3 rounded-full transition-colors", localEdits.flipX ? "bg-violet-500 text-white" : "bg-zinc-800/80 backdrop-blur-md text-white hover:bg-zinc-700")}
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setLocalEdits(prev => ({ ...prev, flipY: !prev.flipY }))}
                className={cn("p-3 rounded-full transition-colors", localEdits.flipY ? "bg-violet-500 text-white" : "bg-zinc-800/80 backdrop-blur-md text-white hover:bg-zinc-700")}
              >
                <FlipVertical className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Tools List */}
        {activeTab === 'adjust' && (
          <div className="flex overflow-x-auto hide-scrollbar px-4 py-2 space-x-2 snap-x">
            {tools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const value = localEdits[tool.id as keyof PhotoEdits] as number;
              const isChanged = value !== tool.default;

              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as keyof PhotoEdits)}
                  className="flex flex-col items-center justify-center min-w-[64px] snap-center"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-1.5 transition-all duration-200",
                    isActive ? "bg-violet-500 text-white scale-110" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800",
                    isChanged && !isActive && "text-white border border-zinc-700"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-violet-500" : "text-zinc-500"
                  )}>
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center space-x-12 py-4 mt-2">
          <button 
            onClick={() => setActiveTab('adjust')}
            className={cn("text-sm font-medium transition-colors pb-1 border-b-2", activeTab === 'adjust' ? "text-white border-violet-500" : "text-zinc-500 border-transparent hover:text-zinc-300")}
          >
            Adjust
          </button>
          <button 
            onClick={() => setActiveTab('crop')}
            className={cn("text-sm font-medium transition-colors pb-1 border-b-2", activeTab === 'crop' ? "text-white border-violet-500" : "text-zinc-500 border-transparent hover:text-zinc-300")}
          >
            Crop
          </button>
        </div>
      </div>
    </motion.div>
  );
};
