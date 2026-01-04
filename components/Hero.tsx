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

  // Animation Loop for Physics-based Tilt
  useEffect(() => {
    if (isMobile) return;

    let requestID: number;
    const ease = 0.08; // Fluid drag

    const update = () => {
      // Linear Interpolation (Lerp)
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;

      // Apply transforms
      if (contentRef.current) {
         contentRef.current.style.transform = `
            perspective(1000px)
            rotateX(${current.current.y}deg) 
            rotateY(${current.current.x}deg)
         `;
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

    // Max rotation
    const maxRot = 10;
    
    target.current = { 
        x: x * maxRot, 
        y: y * -maxRot 
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
      className="h-screen w-full flex flex-col justify-center items-center text-center relative overflow-hidden px-4"
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

      {/* AMBIENT FLUID BACKGROUND (No container box) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-float-slow mix-blend-multiply dark:mix-blend-screen opacity-60"
              style={{ filter: 'url(#liquid-distortion)' }}></div>
         <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-float-medium mix-blend-multiply dark:mix-blend-screen opacity-60"
              style={{ filter: 'url(#liquid-distortion)' }}></div>
      </div>

      {/* CONTENT LAYER - Free floating */}
      <div 
        ref={contentRef}
        className="relative z-10 flex flex-col items-center gap-6 md:gap-8 will-change-transform"
      >
          
          {/* Status Badge */}
          <Reveal triggerOnMount>
            <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-3xl ring-1 ring-white/20 hover:scale-105 transition-transform cursor-default" 
                style={{ transform: 'translateZ(20px)' }}
                data-bot-msg="I am ready to work!|Currently accepting projects.|Hire me?"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-300">Available for Work</span>
            </div>
          </Reveal>
          
          {/* Main Headings */}
          <div style={{ transform: 'translateZ(40px)' }} className="px-4">
            <Reveal delay={100} triggerOnMount>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-gray-900 dark:text-white mb-2">
                Hello, I'm
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient bg-[length:200%_auto] filter drop-shadow-sm pb-2">
                 Bhupesh Bhatt
              </h2>
            </Reveal>
          </div>

          {/* Typewriter Pill (Restored Cleaner Look) */}
          <div style={{ transform: 'translateZ(30px)' }} className="h-8 flex items-center justify-center">
             <Reveal delay={200} triggerOnMount>
               <div className="text-sm md:text-base font-mono text-gray-600 dark:text-gray-300 glass-strong px-6 py-2 rounded-xl border border-white/30 shadow-md ring-1 ring-white/10 hover:border-blue-500/30 transition-colors flex items-center">
                  <span className="text-blue-600 font-bold mr-2">~</span>
                  <span className="text-gray-400 mr-1">$</span>
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-2 h-4 bg-blue-500 align-middle"></span>
               </div>
             </Reveal>
          </div>

          {/* Description */}
          <div style={{ transform: 'translateZ(20px)' }} className="max-w-2xl mx-auto px-6">
            <Reveal delay={300} triggerOnMount>
              <p className="text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                 Engineering high-performance, <span className="text-blue-600 dark:text-blue-400 font-medium">fluid architectures</span> with aesthetic precision. 
                 Bridging design intuition with technical mastery.
              </p>
            </Reveal>
          </div>

          {/* CTA Buttons */}
          <div style={{ transform: 'translateZ(30px)' }} className="mt-4 md:mt-6">
            <Reveal delay={400} triggerOnMount>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                
                <MagneticButton 
                  href="#work" 
                  variant="glass-primary" 
                  className="group px-8 py-3.5"
                  data-bot-msg="Check out the projects!|Seeing is believing.|My best work."
                >
                  <span className="relative flex items-center gap-2.5 text-base">
                    Selected Work 
                    <i className="fas fa-arrow-right text-xs group-hover:translate-x-1.5 transition-transform duration-500"></i>
                  </span>
                </MagneticButton>

                <MagneticButton 
                  href="#contact" 
                  variant="glass-secondary" 
                  className="px-8 py-3.5 text-base"
                  data-bot-msg="Let's start a conversation.|Have an idea?|Contact me."
                >
                   <span className="flex items-center gap-2.5">
                    Let's Talk
                    <i className="fas fa-paper-plane text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                   </span>
                </MagneticButton>

              </div>
            </Reveal>
          </div>
      </div>
    </section>
  );
};

export default Hero;