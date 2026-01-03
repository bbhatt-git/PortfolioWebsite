import React, { useEffect, useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    // Add mouse move listener for background interaction
    const handleMouseMove = (e: MouseEvent) => {
        // Smoother, slightly delayed feel handled by CSS transition on the elements
        // Normalize to -1 to 1 range
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        
        setMousePos({ x, y });
    };
    
    // Only add listener on non-touch devices to save performance
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
      
      {/* BACKGROUND LAYER - Interactive 3D Fluid Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F2F2F7] dark:bg-[#050505] transition-colors duration-700 ease-expo overflow-hidden">
        
        {/* Blob 1 - Top Left - Deep Blue (Moves opposite to mouse) */}
        <div 
            className="absolute top-[-25%] left-[-15%] transition-transform duration-[1500ms] ease-out-expo will-change-transform opacity-60 dark:opacity-30"
            style={{ 
                transform: `translate3d(${mousePos.x * -40}px, ${mousePos.y * -40}px, 0) rotate(${mousePos.x * -5}deg)` 
            }}
        >
            <div className="w-[80vw] h-[80vw] bg-gradient-to-br from-blue-400/40 to-indigo-500/40 dark:from-blue-700/20 dark:to-indigo-900/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 2 - Top Right - Purple/Pink (Moves with mouse) */}
        <div 
            className="absolute top-[-15%] right-[-25%] transition-transform duration-[1800ms] ease-out-expo will-change-transform opacity-60 dark:opacity-30"
            style={{ 
                transform: `translate3d(${mousePos.x * 50}px, ${mousePos.y * 50}px, 0) rotate(${mousePos.x * 5}deg)` 
            }}
        >
            <div className="w-[70vw] h-[70vw] bg-gradient-to-bl from-purple-400/40 to-pink-500/40 dark:from-purple-700/20 dark:to-pink-900/20 rounded-full blur-[120px] animate-blob-reverse animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 3 - Bottom Left - Teal/Indigo (Slow movement) */}
        <div 
            className="absolute bottom-[-30%] left-[-10%] transition-transform duration-[2000ms] ease-out-expo will-change-transform opacity-50 dark:opacity-20"
            style={{ 
                transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * 30}px, 0)` 
            }}
        >
            <div className="w-[65vw] h-[65vw] bg-gradient-to-tr from-indigo-400/30 to-teal-400/30 dark:from-indigo-600/10 dark:to-teal-600/10 rounded-full blur-[140px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 4 - Floating Accent - Cyan (Moves fast for depth) */}
        <div 
            className="absolute top-[30%] right-[10%] transition-transform duration-[1200ms] ease-out-expo will-change-transform opacity-40 dark:opacity-20"
            style={{ 
                transform: `translate3d(${mousePos.x * 80}px, ${mousePos.y * -40}px, 0)` 
            }}
        >
            <div className="w-[40vw] h-[40vw] bg-gradient-to-l from-cyan-300/30 to-blue-500/30 dark:from-cyan-500/20 dark:to-blue-700/20 rounded-full blur-[90px] animate-float-slow mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        {/* Blob 5 - Center Fill - Subtle */}
        <div 
            className="absolute top-[40%] left-[20%] transition-transform duration-[2500ms] ease-fluid will-change-transform opacity-30 dark:opacity-10"
            style={{ 
                transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * 20}px, 0)` 
            }}
        >
             <div className="w-[50vw] h-[50vw] bg-gradient-to-r from-emerald-300/20 to-blue-500/20 dark:from-emerald-500/10 dark:to-blue-700/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>

        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.4] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        {children}
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full glass flex items-center justify-center text-black dark:text-white transition-all duration-500 ease-expo hover:scale-110 hover:shadow-2xl group ${
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