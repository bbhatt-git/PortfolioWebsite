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

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Biography - Spans 2 cols, 2 rows height ideally, but let's keep it flexible */}
          <Reveal className="md:col-span-2">
            <div className="h-full glass-strong rounded-[2rem] p-8 md:p-10 relative overflow-hidden group flex flex-col">
               <div className="relative z-10">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-blue-500/20">
                      <i className="fas fa-user-astronaut"></i>
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Who I Am</h3>
                   <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light mb-8">
                      I am a passionate developer based in Nepal. My expertise spans across the full software development lifecycle—from conceptualizing intuitive UI designs to deploying scalable backend architectures. I thrive on solving complex problems with clean, maintainable code and am always eager to learn the next big thing in tech.
                   </p>
                   
                   <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Open for new opportunities
                   </div>
               </div>
               
               {/* Decorative Gradient */}
               <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </Reveal>

          {/* 2. Resume / CV - Compact Card */}
          <Reveal delay={100} className="md:col-span-1">
             <div 
               className="h-full glass rounded-[2rem] p-8 relative overflow-hidden group cursor-pointer hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-black/5 dark:hover:border-white/10" 
               onClick={() => window.open('assets/cv.pdf', '_blank')}
             >
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-2xl shadow-xl transition-transform group-hover:scale-110">
                            <i className="fas fa-arrow-down transform group-hover:translate-y-1 transition-transform"></i>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-bold uppercase tracking-wider text-gray-500">
                          PDF
                        </span>
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Resume</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Click to download</p>
                    </div>
                </div>
                
                {/* Decorative Icon */}
                <i className="fas fa-file-invoice absolute -bottom-6 -right-6 text-[140px] opacity-[0.03] dark:opacity-[0.05] group-hover:scale-105 transition-transform duration-500 rotate-12"></i>
             </div>
          </Reveal>

          {/* 3. Stats - Spans 1 col */}
           <Reveal delay={200} className="md:col-span-1">
            <div className="h-full glass rounded-[2rem] p-8 flex flex-col justify-center gap-8 relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>

               {STATS.map((stat, idx) => (
                  <div key={idx} className="relative z-10">
                     <h4 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                       {stat.value}
                     </h4>
                     <div className="flex items-center gap-2 mt-1">
                        <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
                     </div>
                  </div>
               ))}
            </div>
          </Reveal>

          {/* 4. Tech Stack Grid - Spans 2 cols */}
          <Reveal delay={300} className="md:col-span-2">
             <div className="glass rounded-[2rem] p-8 md:p-10 h-full relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm">
                       <i className="fas fa-layer-group"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Tech Stack</h3>
                      <p className="text-sm text-gray-500">Tools & Technologies I use</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2.5 relative z-10">
                   {TECH_STACK.map((tech, idx) => (
                      <div 
                        key={idx} 
                        className="group relative px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 cursor-default overflow-hidden"
                      >
                        <span className="relative z-10">{tech}</span>
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                   ))}
                </div>

                {/* Decorative Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)] pointer-events-none"></div>
             </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

export default About;