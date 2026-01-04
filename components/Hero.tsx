import React, { useRef, useState, useEffect } from 'react';
import Reveal from './Reveal';
import MagneticButton from './MagneticButton';

const ROLES = [
  "Full Stack Web Developer",
  "Creative Problem Solver",
  "AI Enthusiast",
  "Open Source Contributor",
  "UI/UX Developer",
  "System Architect"
];

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Physics state for smooth interpolation (Fluid feel)
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  
  // Typing Effect State
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation Loop for Physics-based Tilt (The "Fluid" Movement)
  useEffect(() => {
    if (isMobile) return;

    let requestID: number;
    const ease = 0.08; // Lower = more "viscous" / watery feel

    const update = () => {
      // Linear Interpolation (Lerp)
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;

      // Apply transforms via direct DOM manipulation for performance (60fps)
      if (contentRef.current) {
         // The main glass card tilts
         contentRef.current.style.transform = `
            rotateX(${current.current.y}deg) 
            rotateY(${current.current.x}deg)
         `;
      }
      
      // Update CSS variables for dynamic lighting/sheen
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${(current.current.x + 15) / 30 * 100}%`);
        containerRef.current.style.setProperty('--mouse-y', `${(current.current.y + 15) / 30 * 100}%`);
      }

      requestID = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(requestID);
  }, [isMobile]);

  // Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Normalize -1 to 1
    const x = (e.clientX - centerX) / (width / 2);
    const y = (e.clientY - centerY) / (height / 2);

    // Max rotation in degrees
    const maxRot = 12;
    
    // Set target for the Lerp loop to chase
    target.current = { 
        x: x * maxRot, 
        y: y * -maxRot // Inverted X axis for natural tilt
    };
  };

  const handleMouseLeave = () => {
    target.current = { x: 0, y: 0 };
  };

  // Typing Logic
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % ROLES.length;
      const fullText = ROLES[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 120);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); 
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); 
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <section 
      id="home" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-screen w-full flex flex-col justify-center items-center text-center relative overflow-hidden perspective-2000 px-4"
    >
      {/* SVG FILTERS for Liquid Distortion */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* AMBIENT FLUID BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Moving liquid blobs with SVG filter applied via class or style */}
         <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[80px] animate-float-slow mix-blend-multiply dark:mix-blend-screen opacity-70"
              style={{ filter: 'url(#liquid-distortion)' }}></div>
         <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[80px] animate-float-medium mix-blend-multiply dark:mix-blend-screen opacity-70"
              style={{ filter: 'url(#liquid-distortion)' }}></div>
      </div>

      {/* 3D SCENE CONTAINER */}
      <div 
        ref={contentRef}
        className="relative preserve-3d w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-8 md:p-16 will-change-transform"
      >
        
        {/* GLASSMETHIC REFLECTIVE LAYER (The "Water Surface") */}
        <div 
            className="absolute inset-0 rounded-[3rem] border border-white/20 dark:border-white/5 bg-white/10 dark:bg-white/5 shadow-2xl backdrop-blur-sm pointer-events-none transition-all duration-300"
            style={{
                transform: 'translateZ(-50px)',
                background: `
                    linear-gradient(
                        125deg, 
                        rgba(255,255,255,0.1) 0%, 
                        rgba(255,255,255,0.01) 40%, 
                        rgba(255,255,255,0.01) 60%, 
                        rgba(255,255,255,0.1) 100%
                    )
                `
            }}
        >
            {/* Dynamic Specular Highlight (The "Glint") */}
            <div 
                className="absolute inset-0 rounded-[3rem] opacity-40 mix-blend-overlay transition-opacity duration-300"
                style={{
                    background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.8) 0%, transparent 60%)'
                }}
            ></div>
        </div>

        {/* FLOATING PARTICLES (Inside the water) */}
        <div className="absolute inset-0 pointer-events-none preserve-3d overflow-hidden rounded-[3rem]">
             <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-xl animate-float-fast" style={{ transform: 'translateZ(20px)' }}></div>
             <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-float-slow" style={{ transform: 'translateZ(10px)' }}></div>
        </div>

        {/* CONTENT LAYER */}
        <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 preserve-3d">
          
          {/* Status Badge */}
          <Reveal triggerOnMount>
            <div 
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-xl shadow-lg hover:bg-white/50 transition-colors cursor-default" 
                style={{ transform: 'translateZ(60px)' }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-800 dark:text-gray-200">System Online</span>
            </div>
          </Reveal>
          
          {/* Main Typography */}
          <div style={{ transform: 'translateZ(80px)' }} className="px-4 text-center preserve-3d">
            <Reveal delay={100} triggerOnMount>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900 dark:text-white mb-4 drop-shadow-xl relative">
                <span className="relative inline-block filter drop-shadow-lg">Hello, I'm</span>
                <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient bg-[length:200%_auto] pb-2">
                   Bhupesh Bhatt
                </span>
              </h1>
            </Reveal>
          </div>

          {/* Terminal / Code Box */}
          <div style={{ transform: 'translateZ(50px)' }} className="h-10 flex items-center justify-center preserve-3d w-full">
             <Reveal delay={200} triggerOnMount>
               <div className="group relative flex items-center gap-3 px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:scale-105 hover:shadow-xl">
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <span className="text-blue-600 font-bold font-mono">~</span>
                  <span className="text-gray-400 font-mono">$</span>
                  <span className="font-mono font-medium text-gray-700 dark:text-gray-200 text-sm md:text-base tracking-tight">
                    {text}
                    <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-blue-500 align-middle rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                  </span>
               </div>
             </Reveal>
          </div>

          {/* Description */}
          <div style={{ transform: 'translateZ(40px)' }} className="max-w-2xl mx-auto px-6 preserve-3d">
            <Reveal delay={300} triggerOnMount>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                 Engineering <span className="text-blue-600 dark:text-blue-400 relative inline-block">
                    high-performance
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600/30 dark:bg-blue-400/30 rounded-full"></span>
                 </span>, fluid architectures. Bridging the gap between creative design and technical mastery.
              </p>
            </Reveal>
          </div>

          {/* CTA Buttons */}
          <div style={{ transform: 'translateZ(70px)' }} className="mt-8 preserve-3d">
            <Reveal delay={400} triggerOnMount>
              <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
                
                <MagneticButton href="#work" variant="glass-primary" className="group min-w-[180px]">
                  <span className="relative flex items-center justify-center gap-3 text-sm tracking-wide">
                    View Projects
                    <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </MagneticButton>

                <MagneticButton href="#contact" variant="glass-secondary" className="group min-w-[180px]">
                   <span className="flex items-center justify-center gap-3 text-sm tracking-wide">
                    Contact Me
                    <i className="fas fa-paper-plane text-xs opacity-50 group-hover:opacity-100 transition-opacity group-hover:-translate-y-0.5 group-hover:translate-x-0.5"></i>
                   </span>
                </MagneticButton>

              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Scroll</span>
          <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
      </div>
    </section>
  );
};

export default Hero;