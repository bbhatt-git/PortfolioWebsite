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
        // Normalize coordinates -0.5 to 0.5
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        targetPos.current = { x, y };
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const update = () => {
        // Smooth interpolation for fluid movement
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.04;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.04;
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
      
      {/* GLOBAL ATMOSPHERIC SYSTEM - Multi-layered blurry orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F8FAFC] dark:bg-[#020203] transition-colors duration-1000 ease-out overflow-hidden">
        
        {/* Subtle Ambient Base */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5"></div>

        {/* TOP RIGHT ORB (Deep Blue) */}
        <div 
            className="absolute top-[-15%] right-[-10%] transition-transform duration-[600ms] will-change-transform opacity-60 dark:opacity-40"
            style={{ transform: `translate3d(${mousePos.x * -70}px, ${mousePos.y * -70}px, 0)` }}
        >
            <div className="w-[80vw] h-[80vw] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[140px] animate-blob"></div>
        </div>

        {/* BOTTOM LEFT ORB (Soft Purple) */}
        <div 
            className="absolute bottom-[-20%] left-[-15%] transition-transform duration-[800ms] will-change-transform opacity-50 dark:opacity-30"
            style={{ transform: `translate3d(${mousePos.x * 90}px, ${mousePos.y * 90}px, 0)` }}
        >
            <div className="w-[90vw] h-[90vw] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[160px] animate-blob-reverse"></div>
        </div>

        {/* CENTER ACCENT (Cyan Liquid) */}
        <div 
            className="absolute top-[25%] left-[15%] transition-transform duration-[1000ms] will-change-transform opacity-30 dark:opacity-15"
            style={{ transform: `translate3d(${mousePos.x * -140}px, ${mousePos.y * 160}px, 0)` }}
        >
            <div className="w-[50vw] h-[50vw] bg-cyan-400/15 rounded-full blur-[120px] animate-liquid"></div>
        </div>

        {/* BOTTOM RIGHT ACCENT (Indigo) */}
        <div 
            className="absolute bottom-[10%] right-[10%] transition-transform duration-[700ms] will-change-transform opacity-40 dark:opacity-20"
            style={{ transform: `translate3d(${mousePos.x * 50}px, ${mousePos.y * -40}px, 0)` }}
        >
            <div className="w-[60vw] h-[60vw] bg-indigo-500/15 rounded-full blur-[140px] animate-blob-slow"></div>
        </div>

        {/* Micro-Noise Texture */}
        <div className="absolute inset-0 bg-noise opacity-[0.04] dark:opacity-[0.08] mix-blend-overlay"></div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating Scroll To Top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-black dark:text-white transition-all duration-500 ease-spring hover:scale-110 hover:shadow-2xl group ${
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