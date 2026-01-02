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
      // Adjusted threshold for smoother feel
      setIsScrolled(window.scrollY > 30);

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
      const offset = 80; // Adjusted offset for mobile
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
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? 'pt-3' : 'pt-6 md:pt-8'
        }`}
      >
        <div 
          className={`relative flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled 
              ? 'w-[92%] md:w-[70%] lg:w-[60%] bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl rounded-full px-4 md:px-6 py-2 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' 
              : 'w-full container px-6 py-2 bg-transparent'
          }`}
        >
          {/* LOGO AREA */}
          <a 
            href="#home" 
            onClick={(e) => handleLinkClick(e, '#home')}
            className="group flex items-center gap-2.5 z-50 select-none"
          >
             {/* Icon Container */}
             <div className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-500 ease-out border shadow-sm group-hover:shadow-md ${
                 isScrolled 
                 ? 'w-8 h-8 bg-black dark:bg-white border-transparent' 
                 : 'w-10 h-10 bg-white dark:bg-white/10 border-gray-200 dark:border-white/10'
             }`}>
                {/* Gradient BG for Default State Hover */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isScrolled ? 'opacity-0' : ''}`}></div>
                
                {/* Symbol */}
                <span className={`font-mono font-bold relative z-10 transition-colors duration-300 ${
                    isScrolled 
                    ? 'text-white dark:text-black text-sm' 
                    : 'text-gray-900 dark:text-white group-hover:text-white text-base'
                }`}>
                  {isScrolled ? 'BR' : '<B/>'}
                </span>
             </div>

             {/* Text Label */}
             <div className="flex flex-col leading-none">
                <span className={`font-bold tracking-tight transition-all duration-500 ${
                    isScrolled ? 'text-sm text-gray-900 dark:text-white' : 'text-lg text-gray-900 dark:text-white'
                }`}>
                  Bhupesh<span className="text-blue-600">.</span>
                </span>
                <span className={`text-[9px] font-medium uppercase tracking-widest text-gray-500 transition-all duration-500 ${
                    isScrolled ? 'w-0 overflow-hidden opacity-0 h-0' : 'w-auto opacity-100'
                }`}>
                  Developer
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
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* UTILITIES (Theme, Search, Terminal) */}
          <div className={`flex items-center gap-2 transition-all duration-500 ${isScrolled ? 'pl-2 border-l border-gray-200 dark:border-white/10 ml-2' : 'pl-6 border-l border-gray-200 dark:border-white/10 ml-6'}`}>
            <button 
              onClick={toggleTheme} 
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              aria-label="Toggle Theme"
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
            </button>
            <button 
              onClick={openSearch} 
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              aria-label="Search"
            >
              <i className="fas fa-search text-xs"></i>
            </button>
            <button 
              onClick={openTerminal} 
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              aria-label="Terminal"
            >
              <i className="fas fa-terminal text-xs"></i>
            </button>

            {/* HAMBURGER BUTTON (Mobile) */}
            <button 
              className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1 z-50 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className={`w-5 h-0.5 bg-black dark:bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-black dark:bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-black dark:bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={`fixed inset-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-2xl transition-all duration-500 ease-expo lg:hidden flex flex-col justify-center items-center ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <ul className="flex flex-col items-center gap-6">
          {navLinks.map((link, idx) => (
            <li key={link.name} className={`transform transition-all duration-500 delay-${idx * 100} ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <a 
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-3xl font-bold tracking-tight ${
                  activeSection === link.href.substring(1) 
                    ? 'text-black dark:text-white' 
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        <div className={`mt-12 flex gap-8 transform transition-all duration-500 delay-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
           <a href="https://github.com/bbhatt-git" target="_blank" className="text-2xl text-gray-500 hover:text-black dark:hover:text-white"><i className="fab fa-github"></i></a>
           <a href="https://linkedin.com" target="_blank" className="text-2xl text-gray-500 hover:text-[#0077b5]"><i className="fab fa-linkedin"></i></a>
           <a href="mailto:hello@bbhatt.com.np" className="text-2xl text-gray-500 hover:text-blue-500"><i className="fas fa-envelope"></i></a>
        </div>
      </div>
    </>
  );
};

export default Navbar;