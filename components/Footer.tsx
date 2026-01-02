import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-white/5 pt-20 pb-12 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
                <span className="font-mono font-bold text-white dark:text-black">BR</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Bhupesh Bhatt</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-lg leading-relaxed mb-8">
              Empowering brands through pixel-perfect design and scalable development solutions. Let's create something extraordinary together.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/bbhatt-git" target="_blank" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-all hover:scale-110">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/bhattbhupesh" target="_blank" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 hover:text-[#0077b5] transition-all hover:scale-110">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://www.instagram.com/_bbhatt" target="_blank" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 hover:text-pink-500 transition-all hover:scale-110">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Nav Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Services', 'Work', 'Contact'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link.toLowerCase() === 'work' ? 'work' : link.toLowerCase()}`} 
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block group"
                  >
                    <span className="relative">
                      {link}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6">Connect</h4>
            <ul className="space-y-4 text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-3">
                <i className="fas fa-envelope text-blue-500 opacity-70"></i>
                <a href="mailto:hello@bbhatt.com.np" className="hover:text-gray-900 dark:hover:text-white transition-colors">hello@bbhatt.com.np</a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-map-marker-alt text-blue-500 opacity-70"></i>
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="pt-4">
                 <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Status</p>
                   <p className="text-sm font-bold text-green-500 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     Available for Hire
                   </p>
                 </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-400 order-2 md:order-1">
             © {year} Bhupesh Raj Bhatt. All rights reserved.
          </div>
          
          <div className="order-1 md:order-2">
             <div className="px-6 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-sm font-medium tracking-tight">
                Designed & Crafted by <span className="font-bold text-gray-900 dark:text-white ml-1">Bhupesh Raj Bhatt</span>
             </div>
          </div>

          <div className="flex gap-6 text-xs text-gray-400 order-3">
             <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Privacy</span>
             <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;