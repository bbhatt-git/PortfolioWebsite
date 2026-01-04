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

// Extended list of floating icons for the background - FASTER ANIMATIONS
const FLOATING_ICONS = [
  { icon: 'fab fa-python', color: 'text-yellow-500', position: 'bottom-[15%] left-[5%]', size: 'text-4xl md:text-6xl', animation: 'animate-float-fast', delay: '0s', rotate: '-rotate-12' },
  { icon: 'fab fa-react', color: 'text-blue-400', position: 'top-[12%] right-[5%]', size: 'text-5xl md:text-7xl', animation: 'animate-float-medium', delay: '0.2s', rotate: 'rotate-12' },
  { icon: 'fab fa-git-alt', color: 'text-red-500', position: 'top-[18%] left-[8%]', size: 'text-3xl md:text-4xl', animation: 'animate-float-fast', delay: '0.4s', rotate: '-rotate-6' },
  { icon: 'fab fa-js', color: 'text-yellow-400', position: 'bottom-[20%] right-[8%]', size: 'text-4xl md:text-5xl', animation: 'animate-float-medium', delay: '0.1s', rotate: 'rotate-6' },
  
  // New Icons
  { icon: 'fas fa-database', color: 'text-blue-500', position: 'top-[40%] left-[15%]', size: 'text-2xl md:text-3xl', animation: 'animate-float-fast', delay: '0.3s', rotate: 'rotate-12' },
  { icon: 'fab fa-node', color: 'text-green-500', position: 'bottom-[35%] right-[15%]', size: 'text-4xl md:text-5xl', animation: 'animate-float-fast', delay: '0.5s', rotate: '-rotate-12' },
  { icon: 'fab fa-figma', color: 'text-purple-500', position: 'top-[15%] left-[45%]', size: 'text-3xl md:text-4xl', animation: 'animate-float-medium', delay: '0.2s', rotate: 'rotate-3' },
  { icon: 'fab fa-docker', color: 'text-blue-600', position: 'bottom-[10%] left-[35%]', size: 'text-3xl md:text-4xl', animation: 'animate-float-fast', delay: '0.1s', rotate: 'rotate-6' },
  { icon: 'fab fa-aws', color: 'text-orange-500', position: 'top-[25%] right-[25%]', size: 'text-3xl md:text-4xl', animation: 'animate-float-medium', delay: '0.4s', rotate: '-rotate-6' },
  { icon: 'fab fa-html5', color: 'text-orange-600', position: 'top-[60%] left-[5%]', size: 'text-2xl md:text-3xl', animation: 'animate-float-fast', delay: '0.2s', rotate: 'rotate-12' },
  { icon: 'fab fa-css3-alt', color: 'text-blue-600', position: 'top-[65%] right-[5%]', size: 'text-2xl md:text-3xl', animation: 'animate-float-fast', delay: '0.3s', rotate: '-rotate-12' },
  { icon: 'fab fa-linux', color: 'text-gray-800 dark:text-gray-200', position: 'bottom-[45%] left-[80%]', size: 'text-3xl md:text-4xl', animation: 'animate-float-medium', delay: '0.1s', rotate: 'rotate-0' },
];

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Physics state for smooth interpolation
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  
  // Typing Effect State
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100); // FASTER DEFAULT

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
    // Faster ease for more reactive tilt
    const ease = 0.15; 

    const update = () => {
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = (e.clientX - centerX) / (width / 2);
    const y = (e.clientY - centerY) / (height / 2);
    const maxRot = 15; // More rotation
    target.current = { x: x * maxRot, y: y * -maxRot };
  };

  const handleMouseLeave = () => {
    target.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % ROLES.length;
      const fullText = ROLES[i];
      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
      
      // Much faster typing
      setTypingSpeed(isDeleting ? 25 : 60);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(200); 
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
      {/* 1. ENHANCED 3D BACKGROUND BLOBS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
         <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] md:w-[700px] md:h-[700px] bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70 will-change-transform"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] md:w-[700px] md:h-[700px] bg-gradient-to-tr from-cyan-400/20 via-blue-500/20 to-pink-500/20 rounded-full blur-[100px] animate-blob-reverse mix-blend-multiply dark:mix-blend-screen opacity-70 will-change-transform" style={{ animationDelay: '2s' }}></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>

      {/* 2. FLOATING 3D ICONS (EXTENDED) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         {FLOATING_ICONS.map((icon, idx) => (
             <div 
                key={idx}
                className={`absolute ${icon.position} ${icon.animation} opacity-20 dark:opacity-10 hover:opacity-80 transition-opacity duration-300 will-change-transform`}
                style={{ animationDelay: icon.delay }}
             >
                <div className={`relative w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center transform ${icon.rotate} shadow-lg`}>
                   <i className={`${icon.icon} ${icon.size} ${icon.color} drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]`}></i>
                </div>
             </div>
         ))}
      </div>

      {/* CONTENT LAYER */}
      <div 
        ref={contentRef}
        className="relative z-10 flex flex-col items-center gap-6 md:gap-8 will-change-transform"
      >
          <Reveal triggerOnMount>
            <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-3xl ring-1 ring-white/20 hover:scale-110 transition-transform duration-300 cursor-default" 
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
          
          <div style={{ transform: 'translateZ(40px)' }} className="px-4">
            <Reveal delay={100} triggerOnMount variant="zoom-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-gray-900 dark:text-white mb-2">
                Hello, I'm
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient bg-[length:200%_auto] filter drop-shadow-sm pb-2">
                 Bhupesh Bhatt
              </h2>
            </Reveal>
          </div>

          <div style={{ transform: 'translateZ(30px)' }} className="h-8 flex items-center justify-center">
             <Reveal delay={150} triggerOnMount>
               <div className="text-sm md:text-base font-mono text-gray-600 dark:text-gray-300 glass-strong px-6 py-2 rounded-xl border border-white/30 shadow-md ring-1 ring-white/10 hover:border-blue-500/30 transition-colors flex items-center hover:scale-105 duration-300">
                  <span className="text-blue-600 font-bold mr-2">~</span>
                  <span className="text-gray-400 mr-1">$</span>
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-2 h-4 bg-blue-500 align-middle"></span>
               </div>
             </Reveal>
          </div>

          <div style={{ transform: 'translateZ(20px)' }} className="max-w-2xl mx-auto px-6">
            <Reveal delay={200} triggerOnMount variant="slide">
              <p className="text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                 Engineering high-performance, <span className="text-blue-600 dark:text-blue-400 font-medium">fluid architectures</span> with aesthetic precision. 
                 Bridging design intuition with technical mastery.
              </p>
            </Reveal>
          </div>

          <div style={{ transform: 'translateZ(30px)' }} className="mt-4 md:mt-6">
            <Reveal delay={250} triggerOnMount variant="zoom-in">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <MagneticButton 
                  href="#work" 
                  variant="glass-primary" 
                  className="group px-8 py-3.5"
                  data-bot-msg="Check out the projects!|Seeing is believing.|My best work."
                >
                  <span className="relative flex items-center gap-2.5 text-base">
                    Selected Work 
                    <i className="fas fa-arrow-right text-xs group-hover:translate-x-1.5 transition-transform duration-300 ease-spring"></i>
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