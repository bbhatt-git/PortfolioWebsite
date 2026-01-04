import React, { useEffect, useState, useRef } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        targetPos.current = { x, y };
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const update = () => {
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.05;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.05;
        setMousePos({ x: currentPos.current.x, y: currentPos.current.y });
        rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* GLOBAL ATMOSPHERIC SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F8FAFC] dark:bg-[#020203] transition-colors duration-1000 ease-out overflow-hidden">
        
        {/* Static Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5"></div>

        {/* ORB 1: Deep Blue (Top Right) */}
        <div 
            className="absolute top-[-10%] right-[-10%] transition-transform duration-[400ms] will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * -60}px, ${mousePos.y * -60}px, 0)` }}
        >
            <div className="w-[70vw] h-[70vw] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
        </div>

        {/* ORB 2: Soft Purple (Bottom Left) */}
        <div 
            className="absolute bottom-[-15%] left-[-15%] transition-transform duration-[600ms] will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * 80}px, ${mousePos.y * 80}px, 0)` }}
        >
            <div className="w-[80vw] h-[80vw] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[150px] animate-blob-reverse"></div>
        </div>

        {/* ORB 3: Cyan Accent (Center Drift) */}
        <div 
            className="absolute top-[30%] left-[20%] transition-transform duration-[800ms] will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * -120}px, ${mousePos.y * 140}px, 0)` }}
        >
            <div className="w-[40vw] h-[40vw] bg-cyan-400/5 dark:bg-cyan-500/5 rounded-full blur-[100px] animate-liquid"></div>
        </div>

        {/* ORB 4: Indigo Flash (Bottom Right) */}
        <div 
            className="absolute bottom-[10%] right-[10%] transition-transform duration-[500ms] will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * -30}px, 0)` }}
        >
            <div className="w-[50vw] h-[50vw] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-blob-slow"></div>
        </div>

        {/* Grain Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] dark:opacity-[0.06] mix-blend-overlay"></div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating Scroll To Top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-black dark:text-white transition-all duration-500 ease-spring hover:scale-110 hover:shadow-2xl hover:bg-white dark:hover:bg-mac-gray group ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
        aria-label="Back to Top"
      >
        <i className="fas fa-arrow-up text-sm group-hover:-translate-y-1 transition-transform duration-300"></i>
      </button>
    </div>
  );
};

export default Layout;