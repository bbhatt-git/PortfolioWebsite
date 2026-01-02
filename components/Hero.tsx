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
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Typing Effect State
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

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
        setTimeout(() => setIsDeleting(true), 1500); // Pause at end
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); // Pause before starting new word
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / innerWidth;
    const y = (e.clientY - innerHeight / 2) / innerHeight;
    
    setRotation({
      x: -y * 10, 
      y: x * 10 
    });
  };

  const resetRotation = () => setRotation({ x: 0, y: 0 });

  return (
    <section 
      id="home" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRotation}
      className="min-h-screen flex flex-col justify-center items-center text-center relative pt-24 px-6 overflow-hidden perspective-2000"
    >
      
      {/* 3D Content Wrapper */}
      <div 
        className="relative preserve-3d transition-transform duration-200 ease-out w-full max-w-5xl mx-auto flex flex-col items-center"
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        
        {/* Floating "App Icons" */}
        <div className="absolute inset-0 pointer-events-none preserve-3d">
           {/* React Icon - Top Left */}
          <div className="absolute top-[5%] left-[5%] md:left-[10%] w-16 h-16 md:w-20 md:h-20 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[18px] shadow-2xl flex items-center justify-center animate-float" style={{ transform: 'translateZ(40px)' }}>
              <i className="fab fa-react text-3xl md:text-4xl text-[#61DAFB] animate-spin-slow"></i>
          </div>
          
          {/* Code Icon - Bottom Right */}
          <div className="absolute bottom-[15%] right-[5%] md:right-[10%] w-20 h-20 md:w-24 md:h-24 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[22px] shadow-2xl flex items-center justify-center animate-float animation-delay-2000" style={{ transform: 'translateZ(60px)' }}>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                <i className="fas fa-code text-xl"></i>
              </div>
          </div>

          {/* Design Icon - Top Right */}
          <div className="absolute top-[15%] right-[15%] w-14 h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[16px] shadow-lg flex items-center justify-center animate-float animation-delay-4000 blur-[1px]" style={{ transform: 'translateZ(20px)' }}>
              <i className="fas fa-pen-nib text-2xl text-pink-500"></i>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ transform: 'translateZ(30px)' }} className="mb-8">
          <Reveal>
            <a href="#contact" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm hover:scale-105 transition-transform cursor-pointer">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-300">AVAILABLE FOR WORK</span>
            </a>
          </Reveal>
        </div>
        
        {/* Main Heading */}
        <div style={{ transform: 'translateZ(50px)' }} className="mb-6 relative z-10 w-full max-w-4xl">
          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-black dark:text-white mb-2">
              Hello, I'm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Bhupesh Raj Bhatt
              </span>
            </h1>
          </Reveal>
        </div>

        {/* Unique Typing Effect */}
        <div style={{ transform: 'translateZ(45px)' }} className="mb-10 h-8 flex items-center justify-center">
           <Reveal delay={150}>
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10">
                <span className="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold">&gt;</span>
                <span className="font-mono text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 tracking-wide">
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-2 h-4 bg-blue-600 dark:bg-blue-400 align-middle"></span>
                </span>
             </div>
           </Reveal>
        </div>

        {/* Subheading / Description */}
        <div style={{ transform: 'translateZ(40px)' }} className="max-w-2xl mx-auto mb-12">
          <Reveal delay={200}>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
               Merging technical depth with artistic vision to craft pixel-perfect digital experiences.
            </p>
          </Reveal>
        </div>

        {/* Call to Actions */}
        <div style={{ transform: 'translateZ(60px)' }}>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a 
                href="#work" 
                className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm hover:scale-105 transition-transform duration-300 shadow-xl shadow-blue-500/30"
              >
                View Projects
              </a>
              <a 
                href="#contact" 
                className="px-8 py-3.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-black dark:text-white font-semibold text-sm hover:bg-white dark:hover:bg-white/20 transition-all duration-300"
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