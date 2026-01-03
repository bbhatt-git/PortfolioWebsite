import React, { useEffect, useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* BACKGROUND LAYER - 3D FLUID BLOBS */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F2F2F7] dark:bg-[#050505] transition-colors duration-700 ease-expo overflow-hidden">
        
        {/* Layer 1 - Deep / Slow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-normal"></div>
        
        {/* Layer 2 - Mid / Medium */}
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-normal"></div>
        
        {/* Layer 3 - Bottom / Fast */}
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-normal"></div>
        
        {/* Layer 4 - Accent */}
        <div className="absolute bottom-[30%] right-[30%] w-[25vw] h-[25vw] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[80px] animate-float-slow mix-blend-multiply dark:mix-blend-normal"></div>

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