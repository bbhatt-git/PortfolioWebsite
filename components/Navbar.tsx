import React, { useState, useEffect } from 'react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  openSearch: () => void;
  openTerminal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, openSearch, openTerminal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      // Smoother threshold
      setIsScrolled(window.scrollY > 50);

      const sections = document.querySelectorAll('section');
      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 300) {
          current = section.getAttribute('id') || '';
        }
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = 100;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, "", href);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Work', href: '#work' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-700 ease-expo ${
          isScrolled ? 'pt-6' : 'pt-8'
        }`}
      >
        <div 
          className={`relative flex items-center justify-between transition-all duration-700 ease-expo ${
            isScrolled 
              ? 'w-[85%] md:w-[65%] lg:w-[55%] bg-white/80 dark:bg-[#121212]/70 backdrop-blur-2xl rounded-full px-5 py-2.5 border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]' 
              : 'w-full container px-6 py-2 bg-transparent'
          }`}
        >
          {/* LOGO AREA */}
          <a 
            href="#home" 
            onClick={(e) => handleLinkClick(e, '#home')}
            className="group relative flex items-center gap-3 z-50"
          >
             {/* Logo Symbol - Minimalist Abstract 'B' */}
             <div className="relative w-9 h-9 flex items-center justify-center bg-black dark:bg-white rounded-xl transform transition-all duration-500 ease-expo group-hover:scale-105 group-hover:rotate-3 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Monogram */}
                <span className="font-outfit font-bold text-lg text-white dark:text-black relative z-10 group-hover:text-white transition-colors duration-300">
                  B<span className="text-blue-400 dark:text-blue-600 group-hover:text-white">.</span>
                </span>
             </div>

             {/* Text Reveal on Scroll/Hover */}
             <div className={`hidden md:flex flex-col leading-none overflow-hidden transition-all duration-500 ease-expo ${isScrolled ? 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100' : 'w-auto opacity-100'}`}>
                <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                  Bhupesh
                </span>
             </div>
          </a>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-500 ease-expo rounded-full group ${
                      activeSection === link.href.substring(1)
                        ? 'text-black dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {/* Hover Pill Effect */}
                    <span className={`absolute inset-0 rounded-full bg-black/5 dark:bg-white/10 scale-90 opacity-0 transition-all duration-300 ease-expo group-hover:scale-100 group-hover:opacity-100 ${
                       activeSection === link.href.substring(1) ? 'scale-100 opacity-100 bg-black/5 dark:bg-white/10' : ''
                    }`}></span>
                    
                    <span className="relative z-10">{link.name}</span>
                    
                    {/* Active Dot indicator */}
                    {activeSection === link.href.substring(1) && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* ACTIONS */}
          <div className="flex items-center gap-1.5 pl-2">
            <button
              onClick={openSearch}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 ease-expo hover:text-blue-600 dark:hover:text-blue-400"
              aria-label="Search"
              title="Search (Cmd+K)"
            >
              <i className="fas fa-search text-xs"></i>
            </button>

            <button
              onClick={openTerminal}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 ease-expo hover:text-purple-600 dark:hover:text-purple-400"
              aria-label="Terminal"
              title="Terminal (Cmd+J)"
            >
              <i className="fas fa-terminal text-xs"></i>
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 ease-expo hover:text-orange-500 dark:hover:text-yellow-400"
              aria-label="Toggle Theme"
            >
                <div className="relative w-4 h-4 overflow-hidden">
                  <i className={`fas fa-sun absolute inset-0 transition-all duration-500 ${isDark ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}></i>
                  <i className={`fas fa-moon absolute inset-0 transition-all duration-500 ${isDark ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}></i>
                </div>
            </button>

             {/* Mobile Hamburger */}
             <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 ml-1"
                aria-label="Toggle Menu"
              >
                <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-expo rounded-full ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-expo rounded-full ${isMobileMenuOpen ? 'opacity-0 scale-50' : ''}`}></span>
                <span className={`w-5 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-expo rounded-full ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/90 dark:bg-[#050505]/95 backdrop-blur-3xl transition-all duration-700 ease-expo flex flex-col items-center justify-center ${
          isMobileMenuOpen ? 'opacity-100 visible clip-circle-full' : 'opacity-0 invisible pointer-events-none clip-circle-0'
        }`}
      >
        <div className="flex flex-col gap-8 text-center">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`text-5xl font-bold tracking-tight text-black dark:text-white hover:text-blue-600 transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {link.name}
            </a>
          ))}
        </div>
        
        <div className="absolute bottom-10 text-xs text-gray-400">
           Bhupesh Raj Bhatt © {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
};

export default Navbar;