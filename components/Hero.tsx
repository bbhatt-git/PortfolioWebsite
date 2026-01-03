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
  
  // Mouse position state
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

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

  // Parallax Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; // Division controls sensitivity
    const y = (e.clientY - top - height / 2) / 25;

    setRotate({ x: -y, y: x });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <section 
      id="home" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen flex flex-col justify-center items-center text-center relative pt-20 overflow-hidden perspective-2000"
    >
      
      {/* 3D Container */}
      <div 
        className="relative preserve-3d transition-transform duration-200 ease-out-expo w-full max-w-5xl mx-auto flex flex-col items-center"
        style={{ 
          transform: isMobile ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        
        {/* Floating 3D Elements */}
        <div className="absolute inset-0 pointer-events-none preserve-3d">
            {/* React Icon */}
            <div className="absolute top-[10%] left-[10%] animate-float-slow" style={{ transform: 'translateZ(60px)' }}>
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center shadow-2xl opacity-80">
                    <i className="fab fa-react text-4xl text-[#61DAFB] animate-spin-slow"></i>
                </div>
            </div>
            
            {/* Code Icon */}
            <div className="absolute bottom-[20%] right-[15%] animate-float-medium" style={{ transform: 'translateZ(80px)' }}>
                <div className="w-20 h-20 glass rounded-full flex items-center justify-center shadow-2xl opacity-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                     <i className="fas fa-code text-3xl text-blue-500"></i>
                </div>
            </div>

             {/* Lightning Icon */}
             <div className="absolute top-[20%] right-[20%] animate-float-fast" style={{ transform: 'translateZ(40px)' }}>
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-lg opacity-60">
                     <i className="fas fa-bolt text-2xl text-yellow-500"></i>
                </div>
            </div>
        </div>

        {/* Status Badge */}
        <div style={{ transform: 'translateZ(30px)' }} className="mb-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/50 dark:border-white/10 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-600 dark:text-gray-300">Available for Hire</span>
            </div>
          </Reveal>
        </div>
        
        {/* Main Heading */}
        <div style={{ transform: 'translateZ(50px)' }} className="mb-6 relative z-10 w-full px-4">
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none text-black dark:text-white mb-2 drop-shadow-xl">
              Hello, I'm
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient bg-[length:200%_auto] pb-4">
               Bhupesh Bhatt
            </h1>
          </Reveal>
        </div>

        {/* Typing Effect */}
        <div style={{ transform: 'translateZ(40px)' }} className="mb-10 h-8 flex items-center justify-center">
           <Reveal delay={200}>
             <div className="text-xl md:text-2xl font-mono text-gray-600 dark:text-gray-300 bg-white/30 dark:bg-black/20 backdrop-blur-sm px-6 py-2 rounded-lg border border-white/20">
                <span className="text-blue-500 mr-2">&gt;</span>
                {text}
                <span className="animate-pulse ml-1 inline-block w-2.5 h-5 bg-blue-500 align-middle"></span>
             </div>
           </Reveal>
        </div>

        {/* Description */}
        <div style={{ transform: 'translateZ(30px)' }} className="max-w-2xl mx-auto mb-12 px-6">
          <Reveal delay={300}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-light">
               I build accessible, pixel-perfect, and performant web experiences.
               Passionate about merging <span className="font-semibold text-black dark:text-white">design</span> and <span className="font-semibold text-black dark:text-white">technology</span> to solve real-world problems.
            </p>
          </Reveal>
        </div>

        {/* Buttons */}
        <div style={{ transform: 'translateZ(60px)' }}>
          <Reveal delay={400}>
            <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
              <a 
                href="#work" 
                className="group relative px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold overflow-hidden shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 hover:shadow-blue-500/50"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative flex items-center gap-2">View Projects <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i></span>
              </a>
              <a 
                href="#contact" 
                className="px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-black dark:text-white font-bold hover:bg-white dark:hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
              >
                Contact Me
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;