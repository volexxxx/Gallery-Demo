import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Folder, CheckCircle2, Loader2 } from 'lucide-react';

export const Setup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleGrant = () => {
    setStep(1);
    setTimeout(() => {
      setStep(2);
      setTimeout(() => {
        localStorage.setItem('gallery_setup_complete', 'true');
        onComplete();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-violet-500/10 text-violet-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Gallery</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            To get started, we need access to your photos and videos.
          </p>
        </div>

        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl">
          <div className="flex items-center space-x-4">
            <Folder className="w-6 h-6 text-violet-500" />
            <div className="flex-1">
              <h3 className="font-semibold">Storage Access</h3>
              <p className="text-sm text-zinc-500">Required to load your media</p>
            </div>
            {step > 0 && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
        </div>

        {step === 0 ? (
          <button 
            onClick={handleGrant}
            className="w-full py-4 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl font-semibold transition-colors active:scale-95"
          >
            Grant Access
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {step === 1 ? (
              <>
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-sm font-medium animate-pulse">Scanning device media...</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-500">Ready!</p>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
