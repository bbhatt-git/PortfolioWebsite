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
      // Linear Interpolation (Lerp) factor 0.04 for ultra-smooth fluidity
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.04;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.04;

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / width;
    const y = (e.clientY - top - height / 2) / height;

    // Update target for the animation loop
    targetRotation.current = {
      x: -y * 12, // Reduced tilt for more elegant fluid feel
      y: x * 12
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
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(29, 78, 216, 0.12), transparent 70%)`
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
        
        {/* Floating elements with varied Z-depths for extra 3D parallax feel */}
        <div className="absolute inset-0 pointer-events-none preserve-3d">
          <div className="absolute top-[5%] left-[5%] md:top-[10%] md:left-[12%] w-16 h-16 md:w-24 md:h-24 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl rounded-[22px] shadow-2xl flex items-center justify-center animate-float-slow opacity-50 md:opacity-80 transition-opacity" style={{ transform: isMobile ? 'none' : 'translateZ(120px)' }}>
              <i className="fab fa-react text-2xl md:text-5xl text-[#61DAFB] animate-spin-slow"></i>
          </div>
          
          <div className="absolute bottom-[25%] right-[2%] md:bottom-[20%] md:right-[15%] w-16 h-16 md:w-28 md:h-28 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl rounded-[24px] shadow-2xl flex items-center justify-center animate-float-medium opacity-50 md:opacity-90" style={{ transform: isMobile ? 'none' : 'translateZ(180px)' }}>
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-10 h-10 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white">
                <i className="fas fa-code text-lg md:text-2xl"></i>
              </div>
          </div>

          <div className="absolute top-[15%] right-[10%] md:top-[18%] md:right-[20%] w-12 h-12 md:w-16 md:h-16 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl rounded-[18px] shadow-lg flex items-center justify-center animate-float-fast opacity-40 md:opacity-100" style={{ transform: isMobile ? 'none' : 'translateZ(80px)' }}>
              <i className="fas fa-bolt text-lg md:text-2xl text-yellow-500"></i>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(40px)' }} className="mb-8">
          <Reveal>
            <a href="#contact" className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/60 dark:bg-white/15 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">AVAILABLE FOR COLLABORATION</span>
            </a>
          </Reveal>
        </div>
        
        {/* Main Heading */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(100px)' }} className="mb-6 relative z-10 w-full max-w-4xl px-4">
          <Reveal delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.95] text-black dark:text-white mb-4 drop-shadow-2xl">
              Hello, I'm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient bg-[length:200%_auto]">
                Bhupesh Bhatt
              </span>
            </h1>
          </Reveal>
        </div>

        {/* Unique Typing Effect */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(70px)' }} className="mb-10 h-10 flex items-center justify-center w-full px-4">
           <Reveal delay={150}>
             <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 max-w-full overflow-hidden shadow-2xl">
                <span className="text-blue-600 dark:text-blue-400 font-mono text-base font-black">&gt;</span>
                <span className="font-mono text-sm md:text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate">
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-2 h-5 bg-blue-600 dark:bg-blue-400 align-middle"></span>
                </span>
             </div>
           </Reveal>
        </div>

        {/* Subheading / Description */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(50px)' }} className="max-w-2xl mx-auto mb-14 px-4">
          <Reveal delay={200}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-light tracking-tight">
               Crafting high-performance digital architectures with a focus on fluid aesthetics and seamless functionality.
            </p>
          </Reveal>
        </div>

        {/* Call to Actions */}
        <div style={{ transform: isMobile ? 'none' : 'translateZ(140px)' }}>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full px-10 sm:px-0">
              <a 
                href="#work" 
                className="group relative w-full sm:w-auto px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm overflow-hidden shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-500 hover:-translate-y-2 active:scale-95"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative flex items-center justify-center gap-2">View My Projects <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i></span>
              </a>
              <a 
                href="#contact" 
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 text-black dark:text-white font-bold text-sm hover:bg-white dark:hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 active:scale-95"
              >
                Let's Talk
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;