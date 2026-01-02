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
        
        {/* Soft Moving Orbs - Adjusted opacity for light mode */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-300/10 dark:bg-blue-600/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen transition-all duration-1000"></div>
        <div className="absolute top-[10%] right-[-20%] w-[60vw] h-[60vw] bg-purple-300/10 dark:bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen transition-all duration-1000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-300/10 dark:bg-indigo-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen transition-all duration-1000"></div>
        
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.3] mix-blend-overlay"></div>
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