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
      // Threshold increased to 50 for a more deliberate transition
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
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isScrolled ? 'pt-2 md:pt-4' : 'pt-6 md:pt-10'
        }`}
      >
        <div 
          className={`relative flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isScrolled 
              ? 'w-[92%] md:w-[70%] lg:w-[60%] bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl rounded-full px-4 md:px-6 py-2.5 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' 
              : 'w-full container px-4 md:px-6 py-2 bg-transparent'
          }`}
        >
          {/* LOGO AREA */}
          <a 
            href="#home" 
            onClick={(e) => handleLinkClick(e, '#home')}
            className="group flex items-center relative z-50 select-none"
          >
             {/* Scrolled Logo - BR */}
             <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${
                 isScrolled ? 'max-w-[50px] opacity-100 mr-0' : 'max-w-0 opacity-0 mr-0'
             }`}>
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white shadow-lg flex items-center justify-center whitespace-nowrap transition-colors duration-300">
                    <span className="font-mono font-bold text-white dark:text-black group-hover:text-blue-500 dark:group-hover:text-blue-600 transition-colors">BR</span>
                </div>
             </div>

             {/* Default Logo - >_ Bhupesh Bhatt */}
             <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden flex items-center ${
                 isScrolled ? 'max-w-0 opacity-0' : 'max-w-[300px] opacity-100'
             }`}>
                 <div className="flex items-center gap-3 pl-1 origin-left">
                    <span className="font-mono font-bold text-xl text-blue-600 dark:text-blue-400 animate-pulse-slow whitespace-nowrap group-hover:text-purple-500 transition-colors">{'>_'}</span>
                    <div className="hidden sm:block px-5 py-2 rounded-full bg-blue-50/80 dark:bg-white/5 border border-blue-100 dark:border-white/10 backdrop-blur-md shadow-sm whitespace-nowrap group-hover:shadow-lg group-hover:border-blue-200 dark:group-hover:border-blue-500/30 transition-all">
                        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                        Bhupesh Bhatt
                        </span>
                    </div>
                    {/* Mobile Only Logo Text (Simpler) */}
                    <div className="sm:hidden">
                        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Bhupesh
                        </span>
                    </div>
                 </div>
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
                    className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-500 ease-out rounded-full group ${
                      activeSection === link.href.substring(1)
                        ? 'text-black dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {/* Hover Pill Effect */}
                    <span className={`absolute inset-0 rounded-full bg-black/5 dark:bg-white/10 scale-90 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 ${
                       activeSection === link.href.substring(1) ? 'scale-100 opacity-100 bg-black/5 dark:bg-white/10' : ''
                    }`}></span>
                    
                    <span className="relative z-10">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* UTILITIES (Theme, Search, Terminal) */}
          <div className={`flex items-center gap-2 transition-all duration-500 ${isScrolled ? 'pl-2 border-l border-gray-200 dark:border-white/10 ml-2' : 'pl-2 md:pl-6 border-l border-gray-200 dark:border-white/10 ml-2 md:ml-6'}`}>
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
            {/* TERMINAL BUTTON (Visible on Mobile) */}
            <button 
              onClick={openTerminal} 
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
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

        <div className={`mt-12 flex gap-6 transform transition-all duration-500 delay-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
           <a href="https://github.com/bbhatt-git" target="_blank" className="text-2xl text-gray-500 hover:text-black dark:hover:text-white"><i className="fab fa-github"></i></a>
           <a href="https://www.linkedin.com/in/bhattbhupesh" target="_blank" className="text-2xl text-gray-500 hover:text-[#0077b5]"><i className="fab fa-linkedin"></i></a>
           <a href="https://www.facebook.com/share/1BnJr4X2Ec/" target="_blank" className="text-2xl text-gray-500 hover:text-blue-600"><i className="fab fa-facebook"></i></a>
           <a href="https://www.instagram.com/_bbhatt/?igsh=MWdjZnc3Y2t6bXp1bA%3D%3D#" target="_blank" className="text-2xl text-gray-500 hover:text-pink-500"><i className="fab fa-instagram"></i></a>
           <a href="mailto:hello@bbhatt.com.np" className="text-2xl text-gray-500 hover:text-blue-500"><i className="fas fa-envelope"></i></a>
        </div>
      </div>
    </>
  );
};

export default Navbar;