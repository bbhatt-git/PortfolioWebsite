import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer 
      className="relative bg-white dark:bg-[#080808] border-t border-gray-200 dark:border-white/5 pt-12 md:pt-20 pb-8 md:pb-12 overflow-hidden"
    >
      {/* Decorative Orbs - Static */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"
      ></div>
      <div 
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"
      ></div>
      <div 
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]"
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12 md:mb-20">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:rotate-12">
                <span className="font-mono font-bold text-white dark:text-black">BR</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Bhupesh Bhatt</span>
            </div>
            
            {/* Description - Hidden on Mobile */}
            <p className="hidden md:block text-gray-500 dark:text-gray-400 max-w-sm text-lg leading-relaxed mb-8">
              Empowering brands through pixel-perfect design and scalable development solutions. Let's create something extraordinary together.
            </p>
            
            {/* Social Icons with Branding Colors */}
            <div className="flex gap-4">
              <a href="https://github.com/bbhatt-git" target="_blank" 
                 className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:shadow-xl hover:-translate-y-1 group">
                <i className="fab fa-github text-xl group-hover:rotate-12 transition-transform"></i>
              </a>
              <a href="https://www.linkedin.com/in/bhattbhupesh" target="_blank" 
                 className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110 hover:bg-[#0077b5] hover:text-white hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 group">
                <i className="fab fa-linkedin text-xl group-hover:rotate-12 transition-transform"></i>
              </a>
              <a href="https://www.facebook.com/share/1BnJr4X2Ec/" target="_blank" 
                 className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110 hover:bg-[#1877F2] hover:text-white hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 group">
                 <i className="fab fa-facebook text-xl group-hover:rotate-12 transition-transform"></i>
              </a>
              <a href="https://www.instagram.com/_bbhatt" target="_blank" 
                 className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:shadow-xl hover:shadow-pink-500/20 hover:-translate-y-1 group">
                <i className="fab fa-instagram text-xl group-hover:rotate-12 transition-transform"></i>
              </a>
            </div>
          </div>

          {/* Nav Column - Hidden on Mobile */}
          <div className="hidden md:block">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Services', 'Work', 'Contact'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link.toLowerCase() === 'work' ? 'work' : link.toLowerCase()}`} 
                    className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors inline-block group"
                  >
                    <span className="relative py-1 flex items-center gap-2">
                      <span className="w-0 group-hover:w-2 h-[2px] bg-blue-500 transition-all duration-300"></span>
                      {link}
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
              <li className="flex items-center gap-3 group">
                <i className="fas fa-envelope text-blue-500 group-hover:rotate-12 transition-transform"></i>
                <a href="mailto:hello@bbhatt.com.np" className="hover:text-black dark:hover:text-white transition-colors relative break-all">
                    <span className="relative py-1">
                      hello@bbhatt.com.np
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
                    </span>
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <i className="fas fa-map-marker-alt text-blue-500 group-hover:rotate-12 transition-transform"></i>
                <span className="group-hover:text-black dark:group-hover:text-white transition-colors">Mahendranagar, Nepal</span>
              </li>
              <li className="pt-4">
                 <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-colors group">
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
        <div 
           className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left"
        >
          <div className="text-sm text-gray-400 order-2 md:order-1">
             © {year} Bhupesh Raj Bhatt. All rights reserved.
          </div>
          
          <div className="order-1 md:order-2 w-full md:w-auto">
             <div className="px-6 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-sm font-medium tracking-tight hover:shadow-lg transition-all hover:scale-105 inline-block group">
                Designed & Crafted by <span className="font-bold text-gray-900 dark:text-white ml-1 group-hover:text-blue-600 transition-colors">Bhupesh Raj Bhatt</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;