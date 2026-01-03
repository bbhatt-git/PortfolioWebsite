import React, { useState } from 'react';
import Reveal from './Reveal';
import { STATS } from '../constants';

interface TechItem {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

const About: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null);
  
  const frontendStack: TechItem[] = [
    { name: "React", icon: "fab fa-react", color: "text-blue-400", desc: "A JavaScript library for building user interfaces, maintaining state, and creating reusable UI components." },
    { name: "Next.js", icon: "fas fa-layer-group", color: "text-black dark:text-white", desc: "The React Framework for production, enabling server-side rendering, static site generation, and optimized performance." },
    { name: "Vite", icon: "fas fa-bolt", color: "text-yellow-400", desc: "A build tool that provides a faster and leaner development experience for modern web projects." },
    { name: "TypeScript", icon: "fas fa-code", color: "text-blue-600", desc: "A strongly typed superset of JavaScript that adds static typing, making code more robust and maintainable." },
    { name: "Tailwind CSS", icon: "fas fa-wind", color: "text-cyan-400", desc: "A utility-first CSS framework for rapidly building custom user interfaces without leaving your HTML." },
    { name: "HTML", icon: "fab fa-html5", color: "text-orange-500", desc: "The standard markup language for documents designed to be displayed in a web browser." },
    { name: "CSS", icon: "fab fa-css3-alt", color: "text-blue-500", desc: "Style sheet language used for describing the presentation of a document written in HTML." },
    { name: "JavaScript", icon: "fab fa-js", color: "text-yellow-400", desc: "The programming language of the Web, enabling interactive behavior on web pages." },
    { name: "Flutter", icon: "fas fa-mobile-alt", color: "text-blue-400", desc: "Google's UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase." },
  ];

  const backendStack: TechItem[] = [
    { name: "Node JS", icon: "fab fa-node", color: "text-green-500", desc: "JavaScript runtime built on Chrome's v8 JavaScript engine, perfect for building scalable network applications." },
    { name: "Python", icon: "fab fa-python", color: "text-yellow-300", desc: "A high-level programming language known for its readability and massive ecosystem of libraries." },
    { name: "PHP", icon: "fab fa-php", color: "text-indigo-400", desc: "A popular general-purpose scripting language that is especially suited to web development." },
    { name: "MySQL", icon: "fas fa-database", color: "text-orange-400", desc: "An open-source relational database management system, reliable and widely used." },
    { name: "MongoDB", icon: "fas fa-leaf", color: "text-green-600", desc: "A NoSQL database program that uses JSON-like documents with optional schemas." },
    { name: "Firebase", icon: "fas fa-fire", color: "text-yellow-500", desc: "A platform developed by Google for creating mobile and web applications with real-time databases and authentication." },
    { name: "C", icon: "fas fa-code", color: "text-blue-500", desc: "A foundational procedural programming language that provides low-level access to system memory." },
  ];

  const toolsStack: TechItem[] = [
    { name: "Git", icon: "fab fa-git-alt", color: "text-red-500", desc: "A distributed version control system for tracking changes in source code during software development." },
    { name: "Figma", icon: "fab fa-figma", color: "text-pink-500", desc: "A collaborative web application for interface design, with additional offline features enabled by desktop applications." },
    { name: "Adobe Photoshop", icon: "fas fa-image", color: "text-blue-700", desc: "The industry standard for digital image processing and editing." },
    { name: "Wordpress", icon: "fab fa-wordpress", color: "text-blue-600", desc: "A free and open-source content management system written in PHP and paired with a MySQL or MariaDB database." },
    { name: "AI/ML", icon: "fas fa-brain", color: "text-purple-500", desc: "Leveraging Artificial Intelligence and Machine Learning models to solve complex problems and automate tasks." },
  ];

  const openModal = (tech: TechItem) => {
    setSelectedTech(tech);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedTech(null);
    document.body.style.overflow = 'auto';
  };

  const navigateToCV = () => {
    window.history.pushState({}, '', '/cv');
    window.dispatchEvent(new Event('pushstate'));
  };

  const renderTechPills = (techs: TechItem[]) => (
    <div className="flex flex-wrap gap-2.5">
       {techs.map((tech, i) => (
         <button 
            key={i} 
            onClick={() => openModal(tech)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-sm active:scale-95"
         >
             <i className={`${tech.icon} ${tech.color} text-base group-hover:scale-110 transition-transform`}></i>
             <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{tech.name}</span>
         </button>
       ))}
    </div>
  );

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      
      {/* SECTION BACKGROUND ACCENTS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-liquid pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="skew-up">
          <div className="mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">About Me.</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
               A glimpse into my journey, skills, and professional highlights.
            </p>
          </div>
        </Reveal>

        {/* Top Row: Bio + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Biography */}
          <Reveal variant="rotate-left" className="lg:col-span-2 h-full">
            <div className="h-full glass-strong rounded-[2rem] p-8 md:p-10 relative overflow-hidden group flex flex-col justify-center">
               <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                          <i className="fas fa-user-astronaut"></i>
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold">Who I Am</h3>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Developer & Designer</p>
                       </div>
                   </div>
                   
                   <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light mb-8">
                      I am a passionate developer based in Nepal. My expertise spans across the full software development lifecycle—from conceptualizing intuitive UI designs to deploying scalable backend architectures. I thrive on solving complex problems with clean, maintainable code.
                   </p>
                   
                   <div className="flex flex-wrap gap-4">
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          Open for new opportunities
                      </div>
                      <button 
                         onClick={navigateToCV}
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-80 transition-opacity"
                      >
                         <i className="fas fa-file-alt"></i> View CV
                      </button>
                   </div>
               </div>
               
               {/* Decorative Gradient */}
               <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </Reveal>

          {/* Stats */}
           <Reveal variant="rotate-right" delay={200} className="lg:col-span-1 h-full">
            <div className="h-full glass rounded-[2rem] p-8 flex flex-col justify-center gap-6 relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-liquid"></div>

               {STATS.map((stat, idx) => (
                  <div key={idx} className="relative z-10 p-4 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                     <h4 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:scale-110 transition-transform origin-left">
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
        </div>

        {/* Technical Arsenal Section */}
        <Reveal variant="3d" delay={300}>
            <div className="text-center mb-10">
                <h3 className="text-3xl font-bold mb-3 tracking-tight">My Technical Arsenal</h3>
                <p className="text-gray-500 dark:text-gray-400">Tap on any technology to learn more.</p>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Frontend & Mobile */}
            <Reveal variant="flip-up" delay={400} className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full border-t-4 border-t-blue-500 hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-blue-500/10 group">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md group-hover:rotate-12 transition-transform">
                            <i className="fas fa-desktop text-xl"></i>
                        </span>
                        Frontend & Mobile
                    </h4>
                    {renderTechPills(frontendStack)}
                </div>
            </Reveal>

            {/* Backend & DB */}
            <Reveal variant="flip-up" delay={500} className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full border-t-4 border-t-green-500 hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-green-500/10 group">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shadow-md group-hover:rotate-12 transition-transform">
                            <i className="fas fa-server text-xl"></i>
                        </span>
                        Backend & Data
                    </h4>
                    {renderTechPills(backendStack)}
                </div>
            </Reveal>

            {/* Design & Tools */}
            <Reveal variant="flip-up" delay={600} className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full border-t-4 border-t-purple-500 hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-purple-500/10 group">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-md group-hover:rotate-12 transition-transform">
                            <i className="fas fa-wand-magic-sparkles text-xl"></i>
                        </span>
                        Design & Tools
                    </h4>
                    {renderTechPills(toolsStack)}
                </div>
            </Reveal>
        </div>
      </div>

      {/* Tech Detail Modal */}
      {selectedTech && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-scale-in"
          onClick={closeModal}
        >
          <div 
            className="w-full max-w-md bg-white/90 dark:bg-[#161618]/95 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
             
             <button 
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors z-20 text-gray-500 dark:text-gray-300"
              >
                <i className="fas fa-times text-sm"></i>
             </button>

             <div className="p-8 flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#252528] shadow-xl flex items-center justify-center text-4xl mb-6 border border-white/40 dark:border-white/5 ring-4 ring-white/20 dark:ring-black/20 animate-float-medium">
                    <i className={`${selectedTech.icon} ${selectedTech.color}`}></i>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedTech.name}</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                   {selectedTech.desc}
                </p>
             </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;