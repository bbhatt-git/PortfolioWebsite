import React, { useRef, useState, useEffect } from 'react';
import Reveal from './Reveal';
import MagneticButton from './MagneticButton';

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
  
  // Mouse position state for tilting effect
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

  // Parallax Tilt Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; 
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
      
      {/* 3D Scene Wrapper */}
      <div 
        className="relative preserve-3d transition-transform duration-500 ease-[cubic-bezier(0.03,0.98,0.52,0.99)] w-full max-w-5xl mx-auto flex flex-col items-center"
        style={{ 
          transform: isMobile ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        
        {/* Deep 3D Space Elements */}
        <div className="absolute inset-0 pointer-events-none preserve-3d">
            {/* HERO BLOB: Enhanced 3D Background Atmosphere */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 dark:opacity-15 mix-blend-screen pointer-events-none animate-pulse-slow"
                style={{ 
                    transform: 'translateZ(-100px)',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(147,51,234,0.3) 50%, transparent 70%)' 
                }}
            ></div>

            {/* React Icon - Foreground Deep Layer */}
            <div className="absolute top-[5%] left-[5%] animate-float-slow" style={{ transform: 'translateZ(120px)' }}>
                <div className="w-20 h-20 glass-strong rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/40 ring-1 ring-white/20">
                    <i className="fab fa-react text-5xl text-[#61DAFB] animate-spin-slow"></i>
                </div>
            </div>
            
            {/* Code Icon - Foreground Layer */}
            <div className="absolute bottom-[15%] right-[10%] animate-float-medium" style={{ transform: 'translateZ(150px)' }}>
                <div className="w-24 h-24 glass-strong rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/40 ring-1 ring-white/20">
                     <i className="fas fa-code text-4xl text-blue-500 drop-shadow-md"></i>
                </div>
            </div>

             {/* Lightning Icon - Mid Layer */}
             <div className="absolute top-[25%] right-[15%] animate-float-fast" style={{ transform: 'translateZ(80px)' }}>
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center shadow-lg opacity-80 backdrop-blur-xl border border-white/30 ring-1 ring-white/10">
                     <i className="fas fa-bolt text-3xl text-yellow-500 drop-shadow-sm"></i>
                </div>
            </div>
        </div>

        {/* Status Chip */}
        <div style={{ transform: 'translateZ(60px)' }} className="mb-10">
          <Reveal triggerOnMount>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-strong border border-white/60 dark:border-white/10 shadow-xl backdrop-blur-3xl ring-1 ring-white/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-300">Available for Design & Dev</span>
            </div>
          </Reveal>
        </div>
        
        {/* Title Group */}
        <div style={{ transform: 'translateZ(100px)' }} className="mb-8 relative z-10 w-full px-6">
          <Reveal delay={100} triggerOnMount>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-gray-900 dark:text-white mb-2 drop-shadow-2xl">
              Hello, I'm
            </h1>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient bg-[length:200%_auto] pb-6">
               Bhupesh Bhatt
            </h2>
          </Reveal>
        </div>

        {/* Animated Terminal Command Box */}
        <div style={{ transform: 'translateZ(80px)' }} className="mb-12 h-10 flex items-center justify-center">
           <Reveal delay={200} triggerOnMount>
             <div className="text-lg md:text-xl font-mono text-gray-700 dark:text-gray-200 glass-strong px-8 py-3 rounded-2xl border border-white/40 shadow-xl ring-1 ring-white/20">
                <span className="text-blue-600 font-bold mr-3">~</span>
                <span className="text-gray-400 mr-2">$</span>
                {text}
                <span className="animate-pulse ml-1 inline-block w-2.5 h-6 bg-blue-600 align-middle"></span>
             </div>
           </Reveal>
        </div>

        {/* Hero Bio Description */}
        <div style={{ transform: 'translateZ(60px)' }} className="max-w-3xl mx-auto mb-16 px-8">
          <Reveal delay={300} triggerOnMount>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-light">
               I engineer high-performance, <span className="text-blue-600 dark:text-blue-400 font-medium">accessible architectures</span> with a relentless focus on aesthetics. 
               Blending deep design intuition with technical mastery.
            </p>
          </Reveal>
        </div>

        {/* CTA Interaction Layer */}
        <div style={{ transform: 'translateZ(130px)' }}>
          <Reveal delay={400} triggerOnMount>
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              
              <MagneticButton href="#work" variant="glass-primary" className="group px-10 py-5">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative flex items-center gap-3 text-lg">
                  Explore Selected Work 
                  <i className="fas fa-arrow-right text-sm group-hover:translate-x-2 transition-transform duration-500"></i>
                </span>
              </MagneticButton>

              <MagneticButton href="#contact" variant="glass-secondary" className="px-10 py-5 text-lg">
                Start a Conversation
              </MagneticButton>

            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;