import React from 'react';
import Reveal from './Reveal';
import { TECH_STACK, STATS } from '../constants';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">About Me</h2>
            <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Widget - Large */}
          <div className="lg:col-span-8 glass-strong rounded-[2rem] p-10 relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-xl md:text-2xl leading-relaxed font-light text-gray-800 dark:text-gray-100 mb-8">
                  I am a passionate developer based in Nepal. My expertise spans across the full software development lifecycle - from conceptualizing UI designs to deploying scalable backend architectures. I thrive on solving complex problems with clean, maintainable code.
               </p>
               
               <div className="flex flex-wrap gap-8 mt-auto pt-8 border-t border-gray-200 dark:border-white/10">
                  {STATS.map((stat, idx) => (
                    <div key={idx}>
                       <h4 className="text-4xl font-bold tracking-tight">{stat.value}</h4>
                       <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
                    </div>
                  ))}
               </div>
            </div>
            {/* Abstract Shape Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>

          {/* CV Widget - Small */}
          <div className="lg:col-span-4 glass-strong rounded-[2rem] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
             <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/30 mb-6 group-hover:rotate-12 transition-transform duration-500">
                <i className="fas fa-file-alt"></i>
             </div>
             <h3 className="text-2xl font-bold mb-2">Curriculum Vitae</h3>
             <p className="text-gray-500 mb-6 text-sm">View my full professional journey.</p>
             <a 
               href="assets/cv.pdf" 
               download 
               className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-80 transition-opacity"
             >
               Download PDF
             </a>
          </div>

          {/* Stack Widget - Wide */}
          <div className="lg:col-span-12 glass rounded-[2rem] p-10">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <i className="fas fa-layer-group text-blue-500"></i> Tech Stack
             </h3>
             <div className="flex flex-wrap gap-3">
               {TECH_STACK.map((tech, idx) => (
                 <span 
                   key={idx} 
                   className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform cursor-default"
                 >
                   {tech}
                 </span>
               ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;