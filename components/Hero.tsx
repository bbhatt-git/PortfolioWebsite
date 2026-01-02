import React, { useRef, useState, useEffect } from 'react';
import Reveal from './Reveal';

const ROLES = [
  "Full Stack Web Developer",
  "Creative Problem Solver",
  "AI Enthusiast",
  "Open Source Contributor",
  "UI/UX Developer",
  "Student/Freelancer"
];

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mouse position state for spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for smooth animation (Lerp)
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const [rotationStyle, setRotationStyle] = useState({ x: 0, y: 0 });

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

  // Smooth Animation Loop
  useEffect(() => {
    if (isMobile) return;

    let animationFrameId: number;

    const animate = () => {
      // Linear Interpolation (Lerp) formula: start + (end - start) * factor
      // Factor 0.05 gives it a "heavy", smooth feeling
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.05;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.05;

      setRotationStyle({
        x: currentRotation.current.x,
        y: currentRotation.current.y
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isMobile]);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % ROLES.length;
      const fullText = ROLES[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); 
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / width;
    const y = (e.clientY - top - height / 2) / height;

    // Update target for the animation loop
    targetRotation.current = {
      x: -y * 15, // Max 15 deg tilt
      y: x * 15
    };

    // Update raw mouse pos for spotlight
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    targetRotation.current = { x: 0, y: 0 };
  };

  return (
    <section 
      id="home" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen flex flex-col justify-center items-center text-center relative pt-24 px-6 overflow-hidden perspective-2000"
    >
      
      {/* Dynamic Background Spotlight */}
      {!isMobile && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
          }}
        />
      )}

      {/* 3D Content Wrapper */}
      <div 
        className="relative preserve-3d w-full max-w-5xl mx-auto flex flex-col items-center"
        style={{ 
          transform: isMobile ? 'none' : `rotateX(${rotationStyle.x}deg) rotateY(${rotationStyle.y}deg)`,
        }}
      >
        
        {/* Floating "App Icons" - Responsive Positioning with varied depths */}
        <div className="absolute inset-0 pointer-events-none preserve-3d">
           {/* React Icon - Top Left */}
          <div className="absolute top-[0%] left-[2%] md:top-[5%] md:left-[10%] w-12 h-12 md:w-20 md:h-20 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[14px] md:rounded-[18px] shadow-2xl flex items-center justify-center animate-float-slow opacity-60 md:opacity-100" style={{ transform: isMobile ? 'none' : 'translateZ(60px)' }}>
              <i className="fab fa-react text-2xl md:text-4xl text-[#61DAFB] animate-spin-slow"></i>
          </div>
          
          {/* Code Icon - Bottom Right */}
          <div className="absolute bottom-[20%] right-[2%] md:bottom-[15%] md:right-[10%] w-14 h-14 md:w-24 md:h-24 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[16px] md:rounded-[22px] shadow-2xl flex items-center justify-center animate-float-medium opacity-60 md:opacity-100" style={{ transform: isMobile ? 'none' : 'translateZ(90px)' }}>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-white">
                <i className="fas fa-code text-sm md:text-xl"></i>
              </div>
          </div>

          {/* Design Icon - Top Right */}
          <div className="absolute top-[5%] right-[5%] md:top-[15%] md:right-[15%] w-10 h-10 md:w-14 md:h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[12px] md:rounded-[16px] shadow-lg flex items-center justify-center animate-float-fast blur-[1px] opacity-40 md:opacity-100" style={{ transform: isMobile ? 'none' : 'translateZ(40px)' }}>
              <i className="fas fa-pen-nib text-lg md:text-2xl text-pink-500"></i>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(30px)' }} className="mb-6 md:mb-8">
          <Reveal>
            <a href="#contact" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm hover:scale-105 transition-transform cursor-pointer">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] md:text-[11px] font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-300">AVAILABLE FOR WORK</span>
            </a>
          </Reveal>
        </div>
        
        {/* Main Heading */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(60px)' }} className="mb-6 relative z-10 w-full max-w-4xl px-2">
          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-black dark:text-white mb-2 drop-shadow-2xl">
              Hello, I'm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient bg-[length:200%_auto]">
                Bhupesh Raj Bhatt
              </span>
            </h1>
          </Reveal>
        </div>

        {/* Unique Typing Effect */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(50px)' }} className="mb-8 md:mb-10 h-8 flex items-center justify-center w-full px-4">
           <Reveal delay={150}>
             <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 max-w-full overflow-hidden shadow-lg">
                <span className="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold flex-shrink-0">&gt;</span>
                <span className="font-mono text-xs md:text-base font-medium text-gray-800 dark:text-gray-200 tracking-wide truncate">
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-1.5 h-3 md:w-2 md:h-4 bg-blue-600 dark:bg-blue-400 align-middle"></span>
                </span>
             </div>
           </Reveal>
        </div>

        {/* Subheading / Description */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(40px)' }} className="max-w-2xl mx-auto mb-10 md:mb-12 px-4">
          <Reveal delay={200}>
            <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
               Merging technical depth with artistic vision to craft pixel-perfect digital experiences.
            </p>
          </Reveal>
        </div>

        {/* Call to Actions */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(70px)' }}>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full px-8 sm:px-0">
              <a 
                href="#work" 
                className="group relative w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 text-white font-semibold text-sm overflow-hidden shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative">View Projects</span>
              </a>
              <a 
                href="#contact" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-black dark:text-white font-semibold text-sm hover:bg-white dark:hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                Get in Touch
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;