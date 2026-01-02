import React from 'react';
import Reveal from './Reveal';
import { TECH_STACK, STATS } from '../constants';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">About Me.</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
               A glimpse into my journey, skills, and professional highlights.
            </p>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Biography Card - Spans 2 cols on Desktop */}
          <Reveal className="md:col-span-2 row-span-2">
            <div className="h-full glass-strong rounded-[2rem] p-8 md:p-10 relative overflow-hidden group">
               <div className="relative z-10 h-full flex flex-col">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-blue-500/20">
                      <i className="fas fa-user-astronaut"></i>
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Who I Am</h3>
                   <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light mb-6">
                      I am a passionate developer based in Nepal. My expertise spans across the full software development lifecycle—from conceptualizing intuitive UI designs to deploying scalable backend architectures. I thrive on solving complex problems with clean, maintainable code and am always eager to learn the next big thing in tech.
                   </p>
                   <div className="mt-auto pt-6 border-t border-gray-200 dark:border-white/10">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Open for new opportunities
                      </p>
                   </div>
               </div>
               {/* Decorative Gradient */}
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </Reveal>

          {/* Stats Card */}
          <Reveal delay={100}>
            <div className="glass rounded-[2rem] p-8 flex flex-col justify-center gap-8 h-full">
               {STATS.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                     <h4 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                       {stat.value}
                     </h4>
                     <span className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{stat.label}</span>
                  </div>
               ))}
            </div>
          </Reveal>

          {/* CV/Resume Card */}
          <Reveal delay={200}>
            <div className="group relative glass rounded-[2rem] p-8 flex flex-col justify-between h-full overflow-hidden hover:scale-[1.02] transition-transform duration-500 cursor-pointer" onClick={() => window.open('assets/cv.pdf', '_blank')}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <div>
                  <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl mb-4 shadow-md">
                     <i className="fas fa-file-download"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Curriculum Vitae</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PDF Download</p>
                </div>

                <div className="flex justify-between items-end mt-8">
                   <span className="text-xs font-bold uppercase tracking-wider opacity-60">Updated 2024</span>
                   <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                      <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                   </div>
                </div>
            </div>
          </Reveal>

          {/* Tech Stack Marquee - Spans full width on mobile, 3 cols on Desktop */}
          <Reveal delay={300} className="md:col-span-3">
             <div className="glass rounded-[2rem] p-8 md:p-10 overflow-hidden relative">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <i className="fas fa-layer-group text-blue-500"></i> Tech Arsenal
                </h3>
                
                {/* Marquee Container */}
                <div className="relative flex overflow-x-hidden mask-linear-gradient">
                   {/* Fade Edges */}
                   <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F2F2F7]/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none"></div>
                   <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F2F2F7]/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none"></div>
                   
                   <div className="animate-marquee whitespace-nowrap flex gap-4 py-2">
                      {[...TECH_STACK, ...TECH_STACK].map((tech, idx) => (
                         <span 
                           key={idx} 
                           className="inline-flex items-center px-6 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/5 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm whitespace-nowrap"
                         >
                           {tech}
                         </span>
                      ))}
                   </div>
                </div>
             </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;