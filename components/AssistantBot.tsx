import React, { useEffect, useRef, useState } from 'react';
import { useBot } from '../context/BotContext';

const AssistantBot: React.FC = () => {
  const { message, emotion } = useBot();
  const botRef = useRef<HTMLDivElement>(null);
  
  // Physics state
  const pos = useRef({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const vel = useRef({ x: -0.5, y: -0.5 });
  const target = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  // Mouse tracking for the "Eye"
  const mousePos = useRef({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main Animation Loop
  useEffect(() => {
    let rAF: number;
    
    const loop = () => {
      if (!botRef.current) return;

      // 1. Random Floating Logic (Wandering)
      // Change velocity slightly randomly
      vel.current.x += (Math.random() - 0.5) * 0.05;
      vel.current.y += (Math.random() - 0.5) * 0.05;

      // Damping (Drag)
      vel.current.x *= 0.99;
      vel.current.y *= 0.99;

      // Keep within bounds (Bounce)
      const padding = 60;
      if (pos.current.x < padding) vel.current.x += 0.1;
      if (pos.current.x > window.innerWidth - padding) vel.current.x -= 0.1;
      if (pos.current.y < padding) vel.current.y += 0.1;
      if (pos.current.y > window.innerHeight - padding) vel.current.y -= 0.1;

      // Apply Velocity
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      // Update DOM
      botRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;

      // 2. Eye Tracking Logic
      // Calculate angle to mouse
      const dx = mousePos.current.x - pos.current.x;
      const dy = mousePos.current.y - pos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 8; // Max eye movement in pixels
      
      const angle = Math.atan2(dy, dx);
      // Only track if close-ish, otherwise look forward/idle
      const lookX = Math.cos(angle) * Math.min(dist * 0.05, maxDist);
      const lookY = Math.sin(angle) * Math.min(dist * 0.05, maxDist);
      
      setEyeOffset({ x: lookX, y: lookY });

      rAF = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(rAF);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 z-[60] pointer-events-none will-change-transform"
      ref={botRef}
    >
      {/* 
        ----------------------
        BOT VISUALS (Sci-Fi Orb) 
        ----------------------
      */}
      <div className="relative w-16 h-16 group pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110">
        
        {/* Glow Aura */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-60 transition-colors duration-500 ${
            emotion === 'excited' ? 'bg-purple-500' : 
            emotion === 'happy' ? 'bg-blue-500' : 
            'bg-cyan-500'
        }`}></div>

        {/* Outer Ring (Gyroscopic) */}
        <div className="absolute inset-0 rounded-full border border-white/20 dark:border-white/10 animate-[spin-slow_8s_linear_infinite]" 
             style={{ transform: 'rotateX(60deg)' }}></div>
        <div className="absolute inset-0 rounded-full border border-white/20 dark:border-white/10 animate-[spin-slow_12s_linear_infinite_reverse]" 
             style={{ transform: 'rotateY(60deg)' }}></div>

        {/* Main Core */}
        <div className={`absolute inset-2 rounded-full backdrop-blur-md border border-white/40 shadow-inner flex items-center justify-center overflow-hidden transition-colors duration-500 ${
             emotion === 'excited' ? 'bg-purple-500/80' : 
             emotion === 'happy' ? 'bg-blue-500/80' : 
             'bg-black/60 dark:bg-black/80'
        }`}>
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDFmgjF2MUgwVjB6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LDI1NSwgMC4xKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-30"></div>
            
            {/* The Eye */}
            <div 
                className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10 transition-transform duration-100 ease-out"
                style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
            >
                 <div className="absolute inset-0 bg-cyan-400 blur-[2px] opacity-80 animate-pulse"></div>
            </div>
        </div>
      </div>

      {/* 
        ----------------------
        HOLOGRAPHIC MESSAGE BUBBLE 
        ----------------------
      */}
      <div className={`absolute top-0 left-20 w-64 transform transition-all duration-500 ease-out-expo ${message ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-10 scale-95 pointer-events-none'}`}>
          <div className="relative">
              {/* Connector Line */}
              <div className="absolute top-8 -left-4 w-4 h-[1px] bg-cyan-500/50"></div>
              <div className="absolute top-8 -left-4 w-1 h-1 rounded-full bg-cyan-400"></div>

              {/* Message Box */}
              <div className="bg-black/80 dark:bg-[#0A0A0B]/90 backdrop-blur-xl border border-cyan-500/30 text-cyan-100 p-4 rounded-xl rounded-tl-none shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  
                  {/* Holographic Scan Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-scan pointer-events-none h-[200%]"></div>
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">AI_ASSISTANT v2.0</span>
                      <div className="flex gap-1">
                          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                          <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                      </div>
                  </div>

                  {/* Text */}
                  <p className="text-sm font-mono leading-relaxed relative z-10 text-white shadow-black drop-shadow-md">
                      {message}
                  </p>
              </div>
          </div>
      </div>
      
      <style>{`
        @keyframes scan {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(50%); }
        }
        .animate-scan {
            animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AssistantBot;