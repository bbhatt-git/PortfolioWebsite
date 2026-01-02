import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F5F5F7] dark:bg-black py-12 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-200">Bhupesh Raj Bhatt</span>
            <span className="mx-2">|</span>
            <span>Creative Developer</span>
          </div>
          <div className="flex gap-6">
            <a href="#home" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">Home</a>
            <a href="#work" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">Work</a>
            <a href="#about" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">About</a>
            <a href="#contact" className="hover:underline hover:text-gray-800 dark:hover:text-gray-200">Contact</a>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p>
            Copyright © {year} Bhupesh Raj Bhatt. All rights reserved.
          </p>
          <div className="flex gap-4">
             <span className="hover:underline cursor-pointer">Privacy Policy</span>
             <span className="border-l border-gray-300 dark:border-gray-700 mx-1"></span>
             <span className="hover:underline cursor-pointer">Terms of Use</span>
          </div>
        </div>
        
        <div className="mt-4 text-[10px] text-gray-400 dark:text-gray-600">
          Designed and developed with precision in Nepal.
        </div>
      </div>
    </footer>
  );
};

export default Footer;