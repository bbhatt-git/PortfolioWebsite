import React, { useEffect, useRef, useState } from 'react';
import { useBot } from '../context/BotContext';

const AssistantBot: React.FC = () => {
  const { message, emotion, say, shutup } = useBot();
  const botRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  
  // State
  const [pos, setPos] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left');
  const [isTalking, setIsTalking] = useState(false);

  // Physics Refs
  const vel = useRef({ x: -0.8, y: -0.5 });
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastTime = useRef(0);
  const lastHoveredElement = useRef<HTMLElement | null>(null);

  // --- MESSAGE GENERATOR UTILS ---
  const getRandomMsg = (msgs: string[]) => msgs[Math.floor(Math.random() * msgs.length)];

  const getInteractionMessage = (el: HTMLElement): string | null => {
    const customMsg = el.getAttribute('data-bot-msg');
    if (customMsg) {
      return getRandomMsg(customMsg.split('|'));
    }

    const tag = el.tagName.toLowerCase();
    const text = (el.innerText || el.getAttribute('aria-label') || '').toLowerCase();
    const href = el.getAttribute('href') || '';

    if (tag === 'a') {
      if (href.includes('github')) return getRandomMsg(["Peeking at the code?", "It's open source!", "Github time!"]);
      if (href.includes('linkedin')) return getRandomMsg(["Let's connect!", "Professional mode: ON."]);
      if (href.includes('mailto') || text.includes('contact')) return getRandomMsg(["Writing a message?", "Say hi for me!", "I love mail!"]);
      return getRandomMsg(["Visiting a link?", "Where are we going?", "Clicky clicky!"]);
    }

    if (tag === 'button') {
      if (text.includes('theme')) return getRandomMsg(["Lights out?", "Flashbang!", "Changing the mood."]);
      return getRandomMsg(["Boop!", "Button pressed!", "Doing science."]);
    }

    if (tag === 'input' || tag === 'textarea') return getRandomMsg(["Typing...", "I'm listening.", "Keyboard warrior mode."]);
    if (tag === 'img') return getRandomMsg(["Nice picture!", "Pixel perfect.", "Zooming in..."]);

    return null;
  };

  // --- GLOBAL HOVER LISTENER ---
  useEffect(() => {
    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, input, textarea, img, [role="button"], [data-bot-msg]') as HTMLElement;

      if (interactiveEl) {
        if (lastHoveredElement.current !== interactiveEl) {
          lastHoveredElement.current = interactiveEl;
          const msg = getInteractionMessage(interactiveEl);
          if (msg) say(msg, 3000);
        }
      } else {
        lastHoveredElement.current = null;
      }
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener('mouseover', handleGlobalMouseOver);
    window.addEventListener('mousemove', handleGlobalMouseOver);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      window.removeEventListener('mousemove', handleGlobalMouseOver);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [say]);

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragOffset({ x: clientX - pos.x, y: clientY - pos.y });
    vel.current = { x: 0, y: 0 };
    say(getRandomMsg(["Weeee!", "Going for a ride!", "Hold tight!"]), 2000);
  };

  const handleWindowMouseUp = () => setIsDragging(false);

  const handleWindowMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    setPos({ x: clientX - dragOffset.x, y: clientY - dragOffset.y });
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
      lastTime.current = time;

      // 1. MOVEMENT LOGIC (Pure Random Wandering)
      if (!isDragging) {
        let newX = pos.x;
        let newY = pos.y;

        // Random gentle impulses
        vel.current.x += (Math.random() - 0.5) * 0.15;
        vel.current.y += (Math.random() - 0.5) * 0.15;

        // Dampen velocity
        vel.current.x *= 0.98;
        vel.current.y *= 0.98;

        // Clamp Speed
        const maxSpeed = 1.2;
        vel.current.x = Math.max(Math.min(vel.current.x, maxSpeed), -maxSpeed);
        vel.current.y = Math.max(Math.min(vel.current.y, maxSpeed), -maxSpeed);

        // Apply Velocity
        newX += vel.current.x;
        newY += vel.current.y;

        // Bounce off walls
        const size = 80;
        const padding = 10;
        
        if (newX < padding) { newX = padding; vel.current.x *= -0.8; }
        if (newX > window.innerWidth - size - padding) { newX = window.innerWidth - size - padding; vel.current.x *= -0.8; }
        if (newY < padding) { newY = padding; vel.current.y *= -0.8; }
        if (newY > window.innerHeight - size - padding) { newY = window.innerHeight - size - padding; vel.current.y *= -0.8; }

        setPos({ x: newX, y: newY });
      }

      // 2. EYE TRACKING LOGIC
      if (eyesRef.current) {
        // Calculate center of bot
        const botCenterX = pos.x + 40; // Approx half width
        const botCenterY = pos.y + 40; // Approx half height
        
        const dx = mousePos.current.x - botCenterX;
        const dy = mousePos.current.y - botCenterY;
        const angle = Math.atan2(dy, dx);
        
        // Limit eye distance so they stay on face
        const maxEyeDistance = 6; 
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 20, maxEyeDistance);
        
        const eyeX = Math.cos(angle) * distance;
        const eyeY = Math.sin(angle) * distance;
        
        eyesRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
      }

      // 3. BUBBLE POSITIONING
      if (pos.x > window.innerWidth * 0.6) {
          setBubbleSide('left');
      } else {
          setBubbleSide('right');
      }
      
      setIsTalking(!!message);
      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAF);
  }, [isDragging, pos, message, bubbleSide]);

  return (
    <div 
      className="fixed top-0 left-0 z-[9999] touch-none select-none"
      style={{ 
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* 
        --------------------------
        CUTER ROBOT VISUALS
        --------------------------
      */}
      <div className="relative w-24 h-28 pointer-events-none">
          
          <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'animate-float-medium'}`}>
              
              {/* Antenna with Heart */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-1 h-6 bg-gray-400 dark:bg-gray-500 rounded-full origin-bottom animate-[sway_3s_ease-in-out_infinite]">
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-3 ${message ? 'scale-110' : 'scale-100'} transition-transform`}>
                     {/* Heart Shape CSS */}
                     <div className={`w-full h-full relative ${message ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                     </div>
                  </div>
              </div>

              {/* Head (Rounder & Cuter) */}
              <div className="relative z-10 w-24 h-20 bg-white dark:bg-gray-200 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.15)] border-[3px] border-white flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* Face Screen (Glossy Black) */}
                  <div className="w-20 h-14 bg-[#111] rounded-[1.2rem] flex items-center justify-center relative overflow-hidden ring-2 ring-black/5">
                      
                      {/* Eyes Container (Tracks Mouse) */}
                      <div ref={eyesRef} className="flex gap-2.5 items-center will-change-transform">
                          <div className={`w-4 h-5 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee] ${isTalking ? 'animate-talk-blink' : 'animate-blink'}`}>
                             <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                          </div>
                          <div className={`w-4 h-5 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee] ${isTalking ? 'animate-talk-blink' : 'animate-blink'}`}>
                             <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                          </div>
                      </div>

                      {/* Mouth (Hidden normally, appears when talking if desired, currently using eye blink) */}

                      {/* Blush (Appears when talking) */}
                      <div className={`absolute bottom-1 left-2 w-3 h-2 bg-pink-500/40 rounded-full blur-[2px] transition-opacity duration-500 ${isTalking ? 'opacity-100' : 'opacity-0'}`}></div>
                      <div className={`absolute bottom-1 right-2 w-3 h-2 bg-pink-500/40 rounded-full blur-[2px] transition-opacity duration-500 ${isTalking ? 'opacity-100' : 'opacity-0'}`}></div>
                      
                      {/* Screen Gloss */}
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                  </div>
              </div>

              {/* Tiny Body */}
              <div className="relative -mt-4 mx-auto w-12 h-10 bg-gray-100 dark:bg-gray-300 rounded-[1rem] shadow-md border-[3px] border-white flex justify-center items-center z-0">
                  <div className="w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center">
                     <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan] animate-pulse"></div>
                  </div>
              </div>

              {/* Chubby Floating Arms */}
              <div className="absolute top-12 -left-3 w-4 h-7 bg-white dark:bg-gray-200 rounded-full shadow-sm border-2 border-gray-100 dark:border-gray-400 animate-[float_3s_ease-in-out_infinite] delay-100"></div>
              <div className="absolute top-12 -right-3 w-4 h-7 bg-white dark:bg-gray-200 rounded-full shadow-sm border-2 border-gray-100 dark:border-gray-400 animate-[float_3s_ease-in-out_infinite] delay-300"></div>

              {/* Cute Jet Flame (Bubbles) */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-1 opacity-90">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-[ping_1s_linear_infinite]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-[ping_1.5s_linear_infinite] delay-100"></div>
              </div>
          </div>
      </div>

      {/* 
        --------------------------
        MESSAGE BUBBLE 
        --------------------------
      */}
      <div 
        className={`absolute top-0 w-64 transition-all duration-300 ease-out-expo ${
            message ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        } ${
            bubbleSide === 'left' ? 'right-full mr-2' : 'left-full ml-2'
        }`}
      >
         <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl p-4 rounded-3xl rounded-bl-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border-2 border-gray-100 dark:border-white/10 relative text-sm font-medium text-gray-800 dark:text-gray-100 ring-1 ring-black/5">
             
             {/* Text Content */}
             <p className="leading-relaxed relative z-10 break-words font-sans">
                 {message}
             </p>
         </div>
      </div>

      <style>{`
        @keyframes blink {
            0%, 96%, 100% { transform: scaleY(1); }
            98% { transform: scaleY(0.1); }
        }
        @keyframes talk-blink {
            0%, 100% { height: 20px; }
            50% { height: 16px; }
        }
        @keyframes sway {
            0%, 100% { transform: translateX(-50%) rotate(-5deg); }
            50% { transform: translateX(-50%) rotate(5deg); }
        }
        .animate-blink { animation: blink 3.5s infinite; }
        .animate-talk-blink { animation: talk-blink 0.2s infinite; }
      `}</style>
    </div>
  );
};

export default AssistantBot;