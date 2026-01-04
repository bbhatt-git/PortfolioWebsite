import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  
  // Target is where the mouse is
  const targetPos = useRef({ x: 0, y: 0 });
  // Pos is where the drone is currently
  const pos = useRef({ x: 0, y: 0 });
  // Velocity for tilt calculation
  const vel = useRef({ x: 0, y: 0 });
  const rot = useRef(0);

  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
     // Hide on touch devices
     if (window.matchMedia("(pointer: coarse)").matches) return;

     const onMove = (e: MouseEvent) => {
         targetPos.current = { x: e.clientX, y: e.clientY };
         setIsHidden(false);
         
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

  // Animation Loop - Drone Physics
  useEffect(() => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      
      let rAF: number;
      const loop = () => {
          // Dest is the mouse position with offset so it follows, not covers
          const destX = targetPos.current.x + 32;
          const destY = targetPos.current.y + 32;
          
          // Lower ease = more "floaty" / laggy (Drone behavior)
          const ease = 0.05; 
          
          // Calculate previous position to determine velocity
          const prevX = pos.current.x;
          const prevY = pos.current.y;

          // Lerp position (Follow logic)
          pos.current.x += (destX - pos.current.x) * ease;
          pos.current.y += (destY - pos.current.y) * ease;
          
          // Calculate Velocity
          vel.current.x = pos.current.x - prevX;
          vel.current.y = pos.current.y - prevY;
          
          // Calculate Tilt/Banking based on horizontal velocity
          // Clamp rotation between -25 and 25 degrees
          const targetRotation = Math.min(Math.max(vel.current.x * 2.5, -25), 25);
          rot.current += (targetRotation - rot.current) * 0.1;

          if (cursorRef.current) {
               // Update Drone Position
               cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${rot.current}deg)`;
          }

          // Eye Tracking Logic (Look at the cursor)
          if (eyesRef.current) {
            const angle = Math.atan2(targetPos.current.y - pos.current.y, targetPos.current.x - pos.current.x);
            // Limit eye movement distance
            const eyeX = Math.cos(angle) * 3; 
            const eyeY = Math.sin(angle) * 3;
            eyesRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
          }

          rAF = requestAnimationFrame(loop);
      };
      loop();
      return () => cancelAnimationFrame(rAF);
  }, []);

  if (isHidden) return null;

  return (
    <div 
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform -ml-6 -mt-6"
      ref={cursorRef}
    >
      {/* ROBOT CHARACTER CONTAINER */}
      <div className={`relative transition-all duration-500 ease-out-expo ${isClicking ? 'scale-75' : 'scale-100'}`}>
         
         {/* Floating Hover Animation (Independent of movement) */}
         <div className="animate-float-fast">
            
            {/* DRONE BODY */}
            <div className={`
                w-14 h-14 rounded-2xl backdrop-blur-md border shadow-2xl 
                flex items-center justify-center relative transition-all duration-300
                ${isPointer 
                    ? 'bg-blue-600/90 border-blue-400 shadow-blue-500/40' 
                    : 'bg-white/80 dark:bg-[#1a1a1a]/80 border-white/40 dark:border-white/20'
                }
            `}>
                {/* ANTENNA */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-gray-400 dark:bg-gray-500 origin-bottom transition-transform duration-300"
                     style={{ transform: `translateX(-50%) rotate(${-rot.current * 1.5}deg)` }}></div>
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-lg ${isPointer ? 'bg-red-500 animate-ping' : 'bg-green-400'}`}></div>
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isPointer ? 'bg-red-500' : 'bg-green-400'}`}></div>

                {/* FACE SCREEN */}
                <div className="w-10 h-7 bg-black rounded-lg flex items-center justify-center overflow-hidden relative border border-white/10">
                    
                    {/* EYES CONTAINER (Moves to look at cursor) */}
                    <div ref={eyesRef} className="flex gap-1.5 transition-transform duration-75 ease-linear">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all duration-200 ${isPointer ? 'h-3 rounded-[2px] bg-yellow-400' : 'bg-blue-400 animate-blink'}`}></div>
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all duration-200 ${isPointer ? 'h-3 rounded-[2px] bg-yellow-400' : 'bg-blue-400 animate-blink'}`}></div>
                    </div>
                    
                    {/* Scan line effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-scan pointer-events-none"></div>
                </div>

                {/* MECHANICAL DETAILS */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gray-300 dark:bg-gray-600 rounded-l-md border-r border-black/10"></div>
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gray-300 dark:bg-gray-600 rounded-r-md border-l border-black/10"></div>
            </div>

            {/* JET FLAME (Trail) */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex justify-center opacity-80">
                <div className={`w-3 h-6 rounded-full blur-[3px] animate-pulse transition-colors duration-300 ${isPointer ? 'bg-orange-500' : 'bg-blue-400'}`}></div>
                <div className={`absolute top-1 w-1.5 h-4 rounded-full bg-white blur-[1px]`}></div>
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
          animation: blink 3.5s infinite;
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