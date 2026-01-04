import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  // Physics state
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const rot = useRef(0);

  // Optimization: Use a ref for the target position to avoid re-running the effect loop
  const targetPos = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
     // Hide on touch devices
     if (window.matchMedia("(pointer: coarse)").matches) return;

     const onMove = (e: MouseEvent) => {
         targetPos.current = { x: e.clientX, y: e.clientY };
         setIsHidden(false);
         // Check pointer for interactive state
         const target = e.target as HTMLElement;
         const isClickable = 
            target.tagName.toLowerCase() === 'a' || 
            target.tagName.toLowerCase() === 'button' ||
            target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea' ||
            target.closest('a') !== null || 
            target.closest('button') !== null ||
            target.closest('[role="button"]') !== null ||
            window.getComputedStyle(target).cursor === 'pointer';
         setIsPointer(isClickable);
     };

     const onMouseDown = () => setIsClicking(true);
     const onMouseUp = () => setIsClicking(false);
     const onMouseLeave = () => setIsHidden(true);
     const onMouseEnter = () => setIsHidden(false);

     window.addEventListener('mousemove', onMove);
     window.addEventListener('mousedown', onMouseDown);
     window.addEventListener('mouseup', onMouseUp);
     document.addEventListener('mouseleave', onMouseLeave);
     document.addEventListener('mouseenter', onMouseEnter);

     return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mouseleave', onMouseLeave);
        document.removeEventListener('mouseenter', onMouseEnter);
     };
  }, []);

  // Animation Loop
  useEffect(() => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      
      let rAF: number;
      const loop = () => {
          const destX = targetPos.current.x;
          const destY = targetPos.current.y;
          
          // Ease factor: Lower = more lag/floaty, Higher = tighter follow
          const ease = 0.12; 
          
          // Lerp position
          pos.current.x += (destX - pos.current.x) * ease;
          pos.current.y += (destY - pos.current.y) * ease;
          
          // Calculate Velocity for Tilt
          const vx = (destX - pos.current.x) * ease;
          
          // Rotate based on velocity (max 25deg)
          const targetRot = Math.min(Math.max(vx * 1.5, -25), 25);
          rot.current += (targetRot - rot.current) * 0.1;

          if (cursorRef.current) {
               // Offset by -50% (handled by negative margins in class) to center
               cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${rot.current}deg)`;
          }
          rAF = requestAnimationFrame(loop);
      };
      loop();
      return () => cancelAnimationFrame(rAF);
  }, []);

  if (isHidden) return null;

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform -ml-6 -mt-6"
    >
      {/* ROBOT CHARACTER CONTAINER */}
      <div className={`relative transition-all duration-300 ${isClicking ? 'scale-90' : 'scale-100'}`}>
         
         {/* Floating Animation Wrapper */}
         <div className="animate-float-fast">
            
            {/* BODY */}
            <div className={`
                w-12 h-12 rounded-xl backdrop-blur-md border border-white/40 shadow-xl 
                flex items-center justify-center relative transition-colors duration-300
                ${isPointer ? 'bg-blue-500/80 border-blue-300' : 'bg-white/60 dark:bg-black/60 dark:border-white/20'}
            `}>
                {/* ANTENNA */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-400 dark:bg-gray-500"></div>
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isPointer ? 'bg-red-500 animate-ping' : 'bg-blue-400'}`}></div>

                {/* FACE SCREEN */}
                <div className="w-8 h-6 bg-black rounded-md flex items-center justify-center gap-1.5 overflow-hidden relative">
                    {/* EYES */}
                    <div className={`w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,1)] transition-all duration-200 ${isPointer ? 'h-3 rounded-sm bg-yellow-400' : 'animate-blink'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,1)] transition-all duration-200 ${isPointer ? 'h-3 rounded-sm bg-yellow-400' : 'animate-blink'}`}></div>
                    
                    {/* Scan line effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan"></div>
                </div>

                {/* EAR PIECES */}
                <div className="absolute -left-1 w-1 h-3 bg-gray-300 dark:bg-gray-600 rounded-l-sm"></div>
                <div className="absolute -right-1 w-1 h-3 bg-gray-300 dark:bg-gray-600 rounded-r-sm"></div>
            </div>

            {/* JET FLAME (Trail) */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex justify-center">
                <div className={`w-2 h-4 rounded-full blur-[2px] animate-pulse ${isPointer ? 'bg-orange-500' : 'bg-blue-400'}`}></div>
            </div>
         </div>
      </div>
      
      {/* CSS Styles for custom animations not in Tailwind config */}
      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .animate-blink {
          animation: blink 4s infinite;
        }
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;