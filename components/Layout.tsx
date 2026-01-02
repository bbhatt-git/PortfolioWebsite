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
      
      {/* BACKGROUND LAYER - Smoother Ambient Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#F2F2F7] dark:bg-[#050505] transition-colors duration-1000 ease-expo">
        
        {/* Soft Moving Orbs - Adjusted for slower, more fluid motion */}
        <div className="absolute top-[-25%] left-[-15%] w-[80vw] h-[80vw] bg-blue-400/10 dark:bg-blue-600/15 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[5%] right-[-25%] w-[70vw] h-[70vw] bg-purple-400/10 dark:bg-purple-600/15 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-25%] left-[10%] w-[75vw] h-[75vw] bg-indigo-400/10 dark:bg-indigo-600/15 rounded-full blur-[120px] animate-blob animation-delay-8000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[40%] right-[10%] w-[50vw] h-[50vw] bg-cyan-400/5 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-blob animation-delay-12000 mix-blend-multiply dark:mix-blend-screen"></div>
        
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.35] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        {children}
      </div>

      {/* Back to top button - Minimalist */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full bg-white/20 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center text-black dark:text-white transition-all duration-500 ease-expo hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110 hover:shadow-2xl ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
        aria-label="Back to Top"
      >
        <i className="fas fa-arrow-up text-xs"></i>
      </button>
    </div>
  );
};

export default Layout;