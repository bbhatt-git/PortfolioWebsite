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

const FLOATING_ICONS = [
  { icon: 'fab fa-python', color: 'text-yellow-500', position: 'bottom-[15%] left-[5%]', size: 'text-4xl md:text-6xl', animation: 'animate-float-fast', delay: '0s', rotate: '-rotate-12' },
  { icon: 'fab fa-react', color: 'text-blue-400', position: 'top-[12%] right-[5%]', size: 'text-5xl md:text-7xl', animation: 'animate-float-medium', delay: '0.2s', rotate: 'rotate-12' },
  { icon: 'fab fa-git-alt', color: 'text-red-500', position: 'top-[18%] left-[8%]', size: 'text-3xl md:text-4xl', animation: 'animate-float-fast', delay: '0.4s', rotate: '-rotate-6' },
  { icon: 'fab fa-js', color: 'text-yellow-400', position: 'bottom-[20%] right-[8%]', size: 'text-4xl md:text-5xl', animation: 'animate-float-medium', delay: '0.1s', rotate: 'rotate-6' },
];

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconsLayerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    let requestID: number;
    const ease = 0.1; 

    const update = () => {
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;

      if (contentRef.current) {
         contentRef.current.style.transform = `perspective(1000px) rotateX(${current.current.y * 5}deg) rotateY(${current.current.x * 5}deg)`;
      }

      if (iconsLayerRef.current) {
          iconsLayerRef.current.style.transform = `translate3d(${current.current.x * -20}px, ${current.current.y * -20}px, 0)`;
      }

      requestID = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(requestID);
  }, [isMobile]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) / (width / 2);
    const y = (e.clientY - (top + height / 2)) / (height / 2);
    target.current = { x, y };
  };

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % ROLES.length;
      const fullText = ROLES[i];
      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
      setTypingSpeed(isDeleting ? 40 : 80);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); 
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(100); 
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
      onMouseLeave={() => target.current = { x: 0, y: 0 }}
      className="min-h-screen w-full flex flex-col justify-center items-center text-center relative overflow-hidden px-4"
    >
      {/* LOCAL ACCENTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 dark:bg-white/5 rounded-full blur-[100px] animate-pulse-slow"></div>
      </div>

      {/* FLOATING ICONS */}
      <div ref={iconsLayerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden will-change-transform opacity-40">
         {FLOATING_ICONS.map((icon, idx) => (
             <div 
                key={idx}
                className={`absolute ${icon.position} ${icon.animation}`}
                style={{ animationDelay: icon.delay }}
             >
                <div className={`w-12 h-12 md:w-20 md:h-20 glass rounded-2xl flex items-center justify-center transform ${icon.rotate} shadow-lg border border-white/20`}>
                   <i className={`${icon.icon} text-2xl md:text-4xl ${icon.color}`}></i>
                </div>
             </div>
         ))}
      </div>

      {/* CONTENT STACK - pt-24 fixes the navbar overlap */}
      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-6 md:gap-8 pt-24 md:pt-32 pb-12 will-change-transform">
          
          <Reveal triggerOnMount variant="fade">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/40 dark:border-white/10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Available for Hire</span>
            </div>
          </Reveal>

          <div className="px-4">
            <Reveal triggerOnMount variant="slide">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-gray-900 dark:text-white mb-2">
                Hello, I'm
              </h1>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                 Bhupesh Bhatt
              </h2>
            </Reveal>
          </div>

          <div className="h-10 flex items-center justify-center">
             <Reveal triggerOnMount variant="fade">
               <div className="text-sm md:text-lg font-mono text-gray-600 dark:text-gray-300 glass px-8 py-2.5 rounded-2xl border border-white/30 shadow-sm flex items-center">
                  <span className="text-blue-600 font-bold mr-2">~</span>
                  <span className="text-gray-400 mr-2">$</span>
                  {text}
                  <span className="animate-pulse ml-0.5 inline-block w-2.5 h-5 bg-blue-500 align-middle"></span>
               </div>
             </Reveal>
          </div>

          <div className="max-w-2xl mx-auto px-6">
            <Reveal triggerOnMount variant="slide">
              <p className="text-lg md:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                 Engineering high-performance, <span className="text-blue-600 dark:text-blue-400 font-medium">fluid architectures</span> with aesthetic precision. 
                 Bridging design intuition with technical mastery.
              </p>
            </Reveal>
          </div>

          <div className="mt-4">
            <Reveal triggerOnMount variant="zoom-in">
              <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
                <MagneticButton href="#work" variant="glass-primary" className="group px-10 py-4 shadow-xl">
                  <span className="relative flex items-center gap-3 text-base font-bold">Selected Work <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-2"></i></span>
                </MagneticButton>
                <MagneticButton href="#contact" variant="glass-secondary" className="px-10 py-4 text-base font-bold">
                   <span className="flex items-center gap-3">Let's Talk <i className="fas fa-paper-plane text-xs opacity-60"></i></span>
                </MagneticButton>
              </div>
            </Reveal>
          </div>
      </div>
    </section>
  );
};

export default Hero;