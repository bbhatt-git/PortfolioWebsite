import React, { useEffect, useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    // Add mouse move listener for high-fidelity parallax interaction
    const handleMouseMove = (e: MouseEvent) => {
        // Normalize coordinates to -0.5 to 0.5 range for centered movement
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        setMousePos({ x, y });
    };
    
    // Only enable parallax on high-performance non-touch devices
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
      
      {/* ATMOSPHERIC BACKGROUND LAYER - Interactive 3D Fluid Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F2F2F7] dark:bg-[#050505] transition-colors duration-1000 ease-expo overflow-hidden">
        
        {/* Blob 1 - Top Left - Deep Blue (Large, Heavy, Deep Parallax) */}
        <div 
            className="absolute top-[-30%] left-[-20%] transition-transform duration-[2500ms] ease-[cubic-bezier(0.2,0,0,1)] will-change-transform opacity-70 dark:opacity-40"
            style={{ 
                transform: `translate3d(${mousePos.x * -60}px, ${mousePos.y * -60}px, 0) rotate(${mousePos.x * -10}deg)` 
            }}
        >
            <div className="w-[100vw] h-[100vw] bg-gradient-to-br from-blue-400/30 to-indigo-600/30 dark:from-blue-800/20 dark:to-indigo-900/10 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 2 - Top Right - Pink/Purple (Mid-ground Parallax) */}
        <div 
            className="absolute top-[-10%] right-[-20%] transition-transform duration-[3000ms] ease-[cubic-bezier(0.2,0,0,1)] will-change-transform opacity-60 dark:opacity-30"
            style={{ 
                transform: `translate3d(${mousePos.x * 80}px, ${mousePos.y * 80}px, 0) rotate(${mousePos.x * 8}deg)` 
            }}
        >
            <div className="w-[80vw] h-[80vw] bg-gradient-to-bl from-purple-400/30 to-pink-500/30 dark:from-purple-800/15 dark:to-pink-900/10 rounded-full blur-[140px] animate-blob-reverse animation-delay-3000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 3 - Bottom Left - Indigo/Teal (Foreground Parallax, Moves faster) */}
        <div 
            className="absolute bottom-[-25%] left-[-15%] transition-transform duration-[2200ms] ease-[cubic-bezier(0.2,0,0,1)] will-change-transform opacity-50 dark:opacity-20"
            style={{ 
                transform: `translate3d(${mousePos.x * -40}px, ${mousePos.y * 50}px, 0)` 
            }}
        >
            <div className="w-[75vw] h-[75vw] bg-gradient-to-tr from-indigo-500/20 to-teal-400/20 dark:from-indigo-700/10 dark:to-teal-700/10 rounded-full blur-[160px] animate-blob animation-delay-5000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 4 - Floating Accent - Cyan (Small, Fast, Dynamic Depth) */}
        <div 
            className="absolute top-[20%] right-[5%] transition-transform duration-[1500ms] ease-[cubic-bezier(0.2,0,0,1)] will-change-transform opacity-40 dark:opacity-20"
            style={{ 
                transform: `translate3d(${mousePos.x * 120}px, ${mousePos.y * -60}px, 0)` 
            }}
        >
            <div className="w-[50vw] h-[50vw] bg-gradient-to-l from-cyan-300/25 to-blue-400/25 dark:from-cyan-600/10 dark:to-blue-800/10 rounded-full blur-[100px] animate-float-slow mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        {/* Blob 5 - Center Fill - Subtle Breathing Motion */}
        <div 
            className="absolute top-[35%] left-[25%] transition-transform duration-[4000ms] ease-fluid will-change-transform opacity-30 dark:opacity-10"
            style={{ 
                transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * 25}px, 0)` 
            }}
        >
             <div className="w-[60vw] h-[60vw] bg-gradient-to-r from-emerald-200/20 to-blue-600/20 dark:from-emerald-600/5 dark:to-blue-800/10 rounded-full blur-[130px] animate-pulse-slow"></div>
        </div>

        {/* Cinematic Noise Layer */}
        <div className="absolute inset-0 bg-noise opacity-[0.35] mix-blend-overlay"></div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-black dark:text-white transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-110 hover:shadow-2xl hover:bg-white dark:hover:bg-mac-gray group ${
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