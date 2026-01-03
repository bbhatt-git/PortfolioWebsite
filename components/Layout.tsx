import React, { useEffect, useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    // Add mouse move listener for background interaction
    const handleMouseMove = (e: MouseEvent) => {
        // Smoother, slightly delayed feel handled by CSS transition
        setMousePos({
            x: (e.clientX / window.innerWidth) * 2 - 1, // Normalized -1 to 1
            y: (e.clientY / window.innerHeight) * 2 - 1
        });
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
        
        {/* Blob 1 - Top Left - Deep Blue */}
        <div 
            className="absolute top-[-20%] left-[-10%] transition-transform duration-[2s] ease-out-expo will-change-transform opacity-60 dark:opacity-40"
            style={{ transform: `translate3d(${mousePos.x * -40}px, ${mousePos.y * -40}px, 0)` }}
        >
            <div className="w-[70vw] h-[70vw] bg-gradient-to-br from-blue-400/30 to-indigo-500/30 dark:from-blue-600/20 dark:to-indigo-800/20 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 2 - Top Right - Purple */}
        <div 
            className="absolute top-[-10%] right-[-20%] transition-transform duration-[2.5s] ease-out-expo will-change-transform opacity-60 dark:opacity-40"
            style={{ transform: `translate3d(${mousePos.x * 50}px, ${mousePos.y * 50}px, 0)` }}
        >
            <div className="w-[60vw] h-[60vw] bg-gradient-to-bl from-purple-400/30 to-pink-500/30 dark:from-purple-600/20 dark:to-pink-800/20 rounded-full blur-[140px] animate-blob-reverse animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 3 - Bottom Left - Indigo/Pink */}
        <div 
            className="absolute bottom-[-20%] left-[-10%] transition-transform duration-[2.2s] ease-out-expo will-change-transform opacity-50 dark:opacity-30"
            style={{ transform: `translate3d(${mousePos.x * -60}px, ${mousePos.y * 60}px, 0)` }}
        >
            <div className="w-[60vw] h-[60vw] bg-gradient-to-tr from-indigo-400/30 to-teal-400/30 dark:from-indigo-600/20 dark:to-teal-600/20 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 4 - Center/Right - Cyan Accent - Moves Faster for depth */}
        <div 
            className="absolute top-[30%] right-[5%] transition-transform duration-[3s] ease-out-expo will-change-transform opacity-40 dark:opacity-25"
            style={{ transform: `translate3d(${mousePos.x * 80}px, ${mousePos.y * -30}px, 0)` }}
        >
            <div className="w-[45vw] h-[45vw] bg-gradient-to-l from-cyan-300/30 to-blue-500/30 dark:from-cyan-500/20 dark:to-blue-700/20 rounded-full blur-[110px] animate-float-slow mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        {/* Blob 5 - Center/Left - Subtle Fill */}
        <div 
            className="absolute top-[40%] left-[10%] transition-transform duration-[3.5s] ease-out-expo will-change-transform opacity-40 dark:opacity-20"
            style={{ transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * 20}px, 0)` }}
        >
             <div className="w-[35vw] h-[35vw] bg-gradient-to-r from-emerald-300/20 to-blue-500/20 dark:from-emerald-500/10 dark:to-blue-700/10 rounded-full blur-[90px] animate-blob-reverse animation-delay-2000"></div>
        </div>

        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.35] mix-blend-overlay"></div>
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