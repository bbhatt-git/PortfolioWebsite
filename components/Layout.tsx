import React, { useEffect, useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    const handleMouseMove = (e: MouseEvent) => {
        // Normalize coordinates and increase sensitivity
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        setMousePos({ x, y });
    };
    
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* ATMOSPHERIC BACKGROUND LAYER - Multi-depth Liquid Cosmos */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F2F2F7] dark:bg-[#050505] transition-colors duration-500 ease-out overflow-hidden">
        
        {/* Layer 0: Deep Ambient Glow (Static) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 dark:from-blue-900/5 dark:to-purple-900/5"></div>

        {/* Layer 1: Distant Heavy Blobs (High Parallax) */}
        <div 
            className="absolute top-[-20%] left-[-10%] transition-transform duration-[800ms] ease-out will-change-transform opacity-40 dark:opacity-20"
            style={{ 
                // Increased speed multipliers (x80 instead of x40)
                transform: `translate3d(${mousePos.x * -80}px, ${mousePos.y * -80}px, 0)` 
            }}
        >
            <div className="w-[100vw] h-[100vw] bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-[140px] animate-blob"></div>
        </div>

        {/* Layer 2: Mid-ground Fluid Clusters */}
        <div 
            className="absolute bottom-[-10%] right-[-15%] transition-transform duration-[1000ms] ease-out will-change-transform opacity-30 dark:opacity-15"
            style={{ 
                transform: `translate3d(${mousePos.x * 100}px, ${mousePos.y * 100}px, 0)` 
            }}
        >
            <div className="w-[85vw] h-[85vw] bg-gradient-to-tl from-purple-400/20 to-pink-500/20 rounded-full blur-[160px] animate-blob-reverse animation-delay-4000"></div>
        </div>

        {/* Layer 3: Dynamic Liquid Vents (Very High Parallax) */}
        <div 
            className="absolute top-[30%] left-[20%] transition-transform duration-[600ms] ease-out will-change-transform opacity-20 dark:opacity-10"
            style={{ 
                transform: `translate3d(${mousePos.x * -140}px, ${mousePos.y * 160}px, 0)` 
            }}
        >
            <div className="w-[50vw] h-[50vw] bg-cyan-400/15 rounded-full blur-[100px] animate-liquid"></div>
        </div>

        <div 
            className="absolute bottom-[20%] left-[5%] transition-transform duration-[700ms] ease-out will-change-transform opacity-15 dark:opacity-5"
            style={{ 
                transform: `translate3d(${mousePos.x * 180}px, ${mousePos.y * -120}px, 0)` 
            }}
        >
            <div className="w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] animate-liquid animation-delay-2000"></div>
        </div>

        {/* Cinematic Grain Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.4] mix-blend-overlay"></div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating Scroll To Top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-black dark:text-white transition-all duration-300 ease-spring hover:scale-110 hover:shadow-2xl hover:bg-white dark:hover:bg-mac-gray group ${
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