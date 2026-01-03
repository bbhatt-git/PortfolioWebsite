import React, { useState, useEffect } from 'react';

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const statusMessages = [
    'INITIALIZING_CORE',
    'LOADING_ASSETS',
    'SYNCING_DATA',
    'CALIBRATING_UI',
    'SYSTEM_READY'
  ];

  useEffect(() => {
    // Progress increment logic
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Non-linear progress for realism
        const increment = Math.random() < 0.2 ? 15 : 2; 
        return Math.min(prev + increment, 100);
      });
    }, 150);

    // Status message cycling
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 400);

    // Final exit timeout
    const exitTimeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onLoadingComplete) onLoadingComplete();
      }, 800); // Wait for exit animation
    }, 2800);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearTimeout(exitTimeout);
    };
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${
        isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      } bg-[#F2F2F7] dark:bg-[#050505]`}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-[40vw] h-[40vw] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[80px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay"></div>
      </div>

      <div className="relative flex flex-col items-center z-10 w-full max-w-md px-6">
        
        {/* Massive Percentage Counter */}
        <div className="flex items-start mb-8 relative">
            <span className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-gray-900 dark:text-white tabular-nums leading-none">
              {Math.round(progress).toString().padStart(2, '0')}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-500 mt-2 md:mt-4">%</span>
            
            {/* Decorative decorative lines */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-1">
                <div className="w-8 h-[2px] bg-black/10 dark:bg-white/10"></div>
                <div className="w-5 h-[2px] bg-black/10 dark:bg-white/10"></div>
                <div className="w-8 h-[2px] bg-black/10 dark:bg-white/10"></div>
            </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-gray-200 dark:bg-white/5 relative overflow-hidden">
            {/* Animated Bar */}
            <div 
              className="absolute left-0 top-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-150 ease-linear shadow-[0_0_15px_rgba(37,99,235,0.6)]"
              style={{ width: `${progress}%` }}
            ></div>
            
            {/* Moving Glare on Bar */}
            <div 
                className="absolute top-0 h-full w-20 bg-white/50 blur-[5px]"
                style={{ 
                    left: `${progress}%`, 
                    transform: 'translateX(-100%)',
                    transition: 'left 150ms linear'
                }}
            ></div>
        </div>

        {/* Status Text & Meta Data */}
        <div className="w-full flex justify-between items-end mt-4">
             <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 animate-pulse">
                    {statusMessages[statusIndex]}
                </span>
                <span className="font-mono text-[9px] text-gray-300 dark:text-gray-600">
                    Mem: {Math.round(progress * 12.4)}MB / 1024MB
                </span>
             </div>

             <div className="hidden md:block font-mono text-[9px] text-right text-gray-300 dark:text-gray-700 space-y-0.5">
                 <p>VER: 2.0.4</p>
                 <p>LOC: ASIA_NP</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;