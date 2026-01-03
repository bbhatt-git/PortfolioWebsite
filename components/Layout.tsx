import React, { useEffect, useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    
    // Add mouse move listener for background interaction
    const handleMouseMove = (e: MouseEvent) => {
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
            className="absolute top-[-10%] left-[-10%] transition-transform duration-[1.5s] ease-out-circ will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)` }}
        >
            <div className="w-[60vw] h-[60vw] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 2 - Top Right - Purple */}
        <div 
            className="absolute top-[-10%] right-[-10%] transition-transform duration-[2s] ease-out-circ will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 25}px, 0)` }}
        >
            <div className="w-[50vw] h-[50vw] bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 3 - Bottom Left - Indigo/Pink */}
        <div 
            className="absolute bottom-[-20%] left-[-10%] transition-transform duration-[1.8s] ease-out-circ will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * 30}px, 0)` }}
        >
            <div className="w-[60vw] h-[60vw] bg-pink-500/20 dark:bg-indigo-600/10 rounded-full blur-[140px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        
        {/* Blob 4 - Center/Right - Cyan Accent */}
        <div 
            className="absolute top-[40%] right-[10%] transition-transform duration-[2.5s] ease-out-circ will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * -20}px, 0)` }}
        >
            <div className="w-[40vw] h-[40vw] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[100px] animate-float-slow mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        {/* Blob 5 - Center/Left - Extra Depth */}
        <div 
            className="absolute top-[30%] left-[20%] transition-transform duration-[3s] ease-out-circ will-change-transform opacity-60"
            style={{ transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * 15}px, 0)` }}
        >
             <div className="w-[30vw] h-[30vw] bg-indigo-400/20 dark:bg-blue-400/5 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
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