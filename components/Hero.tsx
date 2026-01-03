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

  // Parallax Tilt Logic - Ultra-fast response for zero-lag feel
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 35; 
    const y = (e.clientY - top - height / 2) / 35;

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
      className="h-screen w-full flex flex-col justify-center items-center text-center relative overflow-hidden perspective-2000 px-4"
    >
      
      {/* 3D Scene Wrapper - Reduced duration and sharpened easing for ultra-snappy feel */}
      <div 
        className="relative preserve-3d transition-transform duration-150 ease-[cubic-bezier(0.03,0.98,0.52,0.99)] w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full"
        style={{ 
          transform: isMobile ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        
        {/* Deep 3D Space Elements */}
        <div className="absolute inset-0 pointer-events-none preserve-3d">
            {/* CENTRAL LIQUID CORE */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none animate-liquid"
                style={{ 
                    transform: 'translateZ(-250px)',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(147,51,234,0.3) 50%, transparent 70%)' 
                }}
            ></div>

            {/* FLOATING TECH ICONS */}
            <div className="absolute top-[5%] left-[5%] animate-float-slow hidden md:block" style={{ transform: 'translateZ(150px)' }}>
                <div className="w-16 h-16 glass-strong rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 ring-1 ring-white/10">
                    <i className="fab fa-react text-4xl text-[#61DAFB] animate-spin-slow"></i>
                </div>
            </div>

            <div className="absolute top-[15%] right-[5%] animate-float-medium hidden md:block" style={{ transform: 'translateZ(180px)' }}>
                <div className="w-14 h-14 glass-strong rounded-xl flex items-center justify-center shadow-xl border border-white/20 ring-1 ring-white/10 bg-blue-500/5">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">TS</span>
                </div>
            </div>

            <div className="absolute bottom-[20%] left-[8%] animate-float-fast hidden md:block" style={{ transform: 'translateZ(200px)' }}>
                <div className="w-20 h-20 glass-strong rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/20 ring-1 ring-white/10 bg-green-500/5 animate-liquid">
                     <i className="fab fa-node-js text-4xl text-green-500"></i>
                </div>
            </div>
            
            <div className="absolute bottom-[10%] right-[10%] animate-float-slow hidden md:block" style={{ transform: 'translateZ(160px)' }}>
                <div className="w-16 h-16 glass-strong rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 ring-1 ring-white/10">
                     <i className="fas fa-code text-2xl text-blue-500 drop-shadow-md"></i>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6">
          
          <Reveal triggerOnMount>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-3xl ring-1 ring-white/20 hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-300">Available for Work</span>
            </div>
          </Reveal>
          
          <div style={{ transform: 'translateZ(100px)' }} className="px-4">
            <Reveal delay={100} triggerOnMount>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-gray-900 dark:text-white mb-2">
                Hello, I'm
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient bg-[length:200%_auto] filter drop-shadow-sm">
                 Bhupesh Bhatt
              </h2>
            </Reveal>
          </div>

          <div style={{ transform: 'translateZ(60px)' }} className="h-8 flex items-center justify-center">
             <Reveal delay={200} triggerOnMount>
               <div className="text-sm md:text-base font-mono text-gray-600 dark:text-gray-300 glass-strong px-6 py-2 rounded-xl border border-white/30 shadow-md ring-1 ring-white/10 hover:border-blue-500/30 transition-colors">
                  <span className="text-blue-600 font-bold mr-2">~</span>
                  <span className="text-gray-400 mr-1">$</span>
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-2 h-4 bg-blue-500 align-middle"></span>
               </div>
             </Reveal>
          </div>

          <div style={{ transform: 'translateZ(40px)' }} className="max-w-2xl mx-auto px-6">
            <Reveal delay={300} triggerOnMount>
              <p className="text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                 Engineering high-performance, <span className="text-blue-600 dark:text-blue-400 font-medium">accessible architectures</span> with aesthetic precision. 
                 Bridging design intuition with technical mastery.
              </p>
            </Reveal>
          </div>

          <div style={{ transform: 'translateZ(120px)' }} className="mt-4 md:mt-6">
            <Reveal delay={400} triggerOnMount>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                
                <MagneticButton href="#work" variant="glass-primary" className="group px-8 py-3.5">
                  <span className="relative flex items-center gap-2.5 text-base">
                    Selected Work 
                    <i className="fas fa-arrow-right text-xs group-hover:translate-x-1.5 transition-transform duration-500"></i>
                  </span>
                </MagneticButton>

                <MagneticButton href="#contact" variant="glass-secondary" className="px-8 py-3.5 text-base">
                   <span className="flex items-center gap-2.5">
                    Let's Talk
                    <i className="fas fa-paper-plane text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                   </span>
                </MagneticButton>

              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;