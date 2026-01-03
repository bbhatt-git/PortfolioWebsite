import React, { useState, useEffect } from 'react';

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const statusMessages = [
    'INITIALIZING_CORE_V2.5',
    'SYNCING_FIRESTORE_DB',
    'CALIBRATING_LIQUID_GLASS',
    'MOUNTING_ARCHITECTURE',
    'SYSTEM_READY_EXPLORE'
  ];

  useEffect(() => {
    // Progress increment logic
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (Math.random() * 15);
      });
    }, 200);

    // Status message cycling
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 500);

    // Final exit timeout
    const exitTimeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onLoadingComplete) onLoadingComplete();
      }, 800); // Wait for exit animation
    }, 2600);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearTimeout(exitTimeout);
    };
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      } bg-[#F2F2F7] dark:bg-[#050505]`}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay"></div>
      </div>

      <div className="relative flex flex-col items-center gap-10">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-black dark:bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center relative z-10 overflow-hidden group">
            <span className="font-mono font-black text-2xl md:text-3xl text-white dark:text-black tracking-tighter">BR</span>
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-50"></div>
          </div>
          
          {/* Pulsing Aura */}
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-2xl -z-0 animate-ping opacity-40"></div>
        </div>

        {/* Progress Info */}
        <div className="flex flex-col items-center gap-4 w-64 md:w-80">
          <div className="flex justify-between w-full mb-1">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
              {statusMessages[statusIndex]}
            </span>
            <span className="font-mono text-[9px] font-black text-blue-600 dark:text-blue-400">
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-[1px] bg-black/5 dark:bg-white/5 relative overflow-hidden rounded-full">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Decorative Corner Text */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="font-mono text-[8px] text-gray-300 dark:text-gray-700 space-y-1">
          <p>ESTABLISHING SECURE CONNECTION...</p>
          <p>ENCRYPTING ASSET PIPELINE...</p>
          <p>READY_STATE_OK</p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;