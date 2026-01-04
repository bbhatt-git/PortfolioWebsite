import React, { useEffect, useRef, useState } from 'react';
import { useBot } from '../context/BotContext';

const AssistantBot: React.FC = () => {
  const { message, emotion } = useBot();
  const botRef = useRef<HTMLDivElement>(null);
  
  // State
  const [pos, setPos] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left');
  const [isTalking, setIsTalking] = useState(false);

  // Physics Refs (Mutable for performance)
  const vel = useRef({ x: -0.8, y: -0.5 });
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastTime = useRef(0);

  // Track global mouse position for "Fly to Hover" logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouchMove = (e: TouchEvent) => {
      mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragOffset({
      x: clientX - pos.x,
      y: clientY - pos.y
    });
    // Stop momentum when grabbed
    vel.current = { x: 0, y: 0 };
  };

  const handleWindowMouseUp = () => {
    setIsDragging(false);
  };

  const handleWindowMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    setPos({
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y
    });
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchend', handleWindowMouseUp);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('touchmove', handleWindowMouseMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchend', handleWindowMouseUp);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('touchmove', handleWindowMouseMove);
    };
  }, [isDragging, dragOffset]);

  // Main Physics Loop
  useEffect(() => {
    let rAF: number;
    
    const loop = (time: number) => {
      if (!lastTime.current) lastTime.current = time;
      const deltaTime = time - lastTime.current; // unused but good for robustness
      lastTime.current = time;

      if (!isDragging) {
        let newX = pos.x;
        let newY = pos.y;

        if (message) {
           // "Cover There" Logic: If talking, fly towards the mouse/hover target
           // Spring force towards mouse
           const dx = mousePos.current.x - (newX + 40); // +40 centers it roughly
           const dy = mousePos.current.y - (newY + 40);
           
           // Smooth acceleration towards target
           vel.current.x += dx * 0.002;
           vel.current.y += dy * 0.002;
           
           // Stronger damping to stop near target
           vel.current.x *= 0.92;
           vel.current.y *= 0.92;

        } else {
           // Idle Wandering Logic
           // Random gentle impulses
           vel.current.x += (Math.random() - 0.5) * 0.1;
           vel.current.y += (Math.random() - 0.5) * 0.1;

           // Max speed limit for wandering
           const maxSpeed = 2;
           vel.current.x = Math.max(Math.min(vel.current.x, maxSpeed), -maxSpeed);
           vel.current.y = Math.max(Math.min(vel.current.y, maxSpeed), -maxSpeed);
           
           // No friction, keeps floating forever
        }

        // Apply Velocity
        newX += vel.current.x;
        newY += vel.current.y;

        // Screen Boundaries (Bounce)
        const size = 80;
        const padding = 20;
        
        if (newX < padding) { newX = padding; vel.current.x *= -0.8; }
        if (newX > window.innerWidth - size - padding) { newX = window.innerWidth - size - padding; vel.current.x *= -0.8; }
        
        if (newY < padding) { newY = padding; vel.current.y *= -0.8; }
        if (newY > window.innerHeight - size - padding) { newY = window.innerHeight - size - padding; vel.current.y *= -0.8; }

        setPos({ x: newX, y: newY });
      }

      // Smart Bubble Positioning
      // If bot is on the right 50% of screen, bubble goes left. Else right.
      if (pos.x > window.innerWidth / 2) {
          setBubbleSide('left');
      } else {
          setBubbleSide('right');
      }
      
      setIsTalking(!!message);
      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAF);
  }, [isDragging, pos, message]);

  return (
    <div 
      className="fixed top-0 left-0 z-[9999] touch-none"
      style={{ 
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* 
        --------------------------
        CUTE ROBOT VISUALS
        --------------------------
      */}
      <div className="relative w-20 h-24 pointer-events-none">
          
          {/* Floating Animation Wrapper */}
          <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'animate-float-medium'}`}>
              
              {/* Antenna */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-4 bg-gray-400 rounded-full">
                  <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${message ? 'bg-green-400 animate-ping' : 'bg-red-400'}`}></div>
                  <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${message ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>

              {/* Head */}
              <div className="relative z-10 w-20 h-16 bg-white dark:bg-gray-200 rounded-[1.5rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)] border-2 border-white/50 flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* Face Screen */}
                  <div className="w-16 h-10 bg-[#050505] rounded-xl flex items-center justify-center gap-2 relative overflow-hidden shadow-inner ring-1 ring-white/10">
                      
                      {/* Scanline */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-scan pointer-events-none"></div>
                      
                      {/* Eyes */}
                      <div className={`w-3 h-4 bg-blue-400 rounded-full shadow-[0_0_10px_#60A5FA] ${isTalking ? 'animate-talk-blink' : 'animate-blink'}`}></div>
                      <div className={`w-3 h-4 bg-blue-400 rounded-full shadow-[0_0_10px_#60A5FA] ${isTalking ? 'animate-talk-blink' : 'animate-blink'}`}></div>
                  </div>

                  {/* Cheeks */}
                  <div className="absolute bottom-2 left-2 w-1.5 h-1 bg-pink-300/50 rounded-full blur-[1px]"></div>
                  <div className="absolute bottom-2 right-2 w-1.5 h-1 bg-pink-300/50 rounded-full blur-[1px]"></div>
              </div>

              {/* Body */}
              <div className="relative -mt-3 mx-auto w-10 h-8 bg-gray-100 dark:bg-gray-300 rounded-b-xl shadow-lg border-x-2 border-b-2 border-white/50 flex justify-center pt-4">
                  <div className="w-4 h-4 rounded-full bg-cyan-400/20 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan] animate-pulse"></div>
                  </div>
              </div>

              {/* Arms (Floating) */}
              <div className="absolute top-10 -left-2 w-3 h-6 bg-white dark:bg-gray-200 rounded-full shadow-md animate-float-fast" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-10 -right-2 w-3 h-6 bg-white dark:bg-gray-200 rounded-full shadow-md animate-float-fast" style={{ animationDelay: '0.5s' }}></div>

              {/* Jet Flame */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex justify-center opacity-80 mix-blend-screen">
                  <div className="w-4 h-6 bg-blue-500 rounded-full blur-[4px] animate-pulse"></div>
                  <div className="absolute top-1 w-2 h-4 bg-white rounded-full blur-[2px]"></div>
              </div>
          </div>
      </div>

      {/* 
        --------------------------
        MESSAGE BUBBLE 
        --------------------------
      */}
      <div 
        className={`absolute top-0 w-64 md:w-72 transition-all duration-300 ease-out-expo ${
            message ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        } ${
            bubbleSide === 'left' ? 'right-full mr-4' : 'left-full ml-4'
        }`}
      >
         <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 relative text-sm font-medium text-gray-800 dark:text-gray-100">
             {/* Speech Triangle */}
             <div className={`absolute top-8 w-3 h-3 bg-white/90 dark:bg-[#1a1a1a]/90 rotate-45 ${
                 bubbleSide === 'left' ? '-right-1.5 border-t border-r border-gray-100 dark:border-white/10' : '-left-1.5 border-b border-l border-gray-100 dark:border-white/10'
             }`}></div>
             
             {/* Typewriter Text */}
             <p className="leading-relaxed relative z-10">
                 {message}
             </p>

             {/* Footer decor */}
             <div className="mt-2 h-0.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-1/3 bg-blue-500 animate-marquee"></div>
             </div>
         </div>
      </div>

      {/* Custom Styles for Robot */}
      <style>{`
        @keyframes blink {
            0%, 96%, 100% { transform: scaleY(1); }
            98% { transform: scaleY(0.1); }
        }
        @keyframes talk-blink {
            0%, 100% { height: 16px; }
            50% { height: 12px; }
        }
        .animate-blink { animation: blink 4s infinite; }
        .animate-talk-blink { animation: talk-blink 0.2s infinite; }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default AssistantBot;