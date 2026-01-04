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
    <div className="relative min-h-screen font-sans selection:bg-blue-500/30">
      
      {/* GLOBAL ATMOSPHERIC BACKGROUND - FIXED & SEAMLESS */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#FBFBFD] dark:bg-[#020203] transition-colors duration-1000 overflow-hidden">
        
        {/* TOP RIGHT ORB */}
        <div 
            className="absolute top-[-10%] right-[-10%] transition-transform duration-[400ms] will-change-transform opacity-60 dark:opacity-40"
            style={{ transform: `translate3d(${mousePos.x * -60}px, ${mousePos.y * -60}px, 0)` }}
        >
            <div className="w-[80vw] h-[80vw] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
        </div>

        {/* BOTTOM LEFT ORB */}
        <div 
            className="absolute bottom-[-15%] left-[-15%] transition-transform duration-[600ms] will-change-transform opacity-50 dark:opacity-30"
            style={{ transform: `translate3d(${mousePos.x * 80}px, ${mousePos.y * 80}px, 0)` }}
        >
            <div className="w-[90vw] h-[90vw] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[150px] animate-blob-reverse"></div>
        </div>

        {/* CENTER DRIFT */}
        <div 
            className="absolute top-[30%] left-[20%] transition-transform duration-[800ms] will-change-transform opacity-30 dark:opacity-10"
            style={{ transform: `translate3d(${mousePos.x * -120}px, ${mousePos.y * 140}px, 0)` }}
        >
            <div className="w-[50vw] h-[50vw] bg-cyan-400/15 rounded-full blur-[100px] animate-liquid"></div>
        </div>

        {/* NOISE OVERLAY */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] dark:opacity-[0.06] mix-blend-overlay"></div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col">
        {children}
      </div>

      {/* SCROLL TO TOP */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-black dark:text-white transition-all duration-500 ease-spring hover:scale-110 hover:shadow-2xl group ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
        aria-label="Back to Top"
      >
        <i className="fas fa-arrow-up text-sm group-hover:-translate-y-1 transition-transform"></i>
      </button>
    </div>
  );
};

export default Layout;