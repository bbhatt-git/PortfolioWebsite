import React from 'react';
import Reveal from './Reveal';
import { STATS } from '../constants';

const About: React.FC = () => {
  
  // Categorized Tech Stack with mock percentages for the "Arsenal" visual
  const frontendStack = [
    { name: "React/Next.js", level: 95, icon: "fab fa-react" },
    { name: "TypeScript", level: 90, icon: "fab fa-js" },
    { name: "Tailwind CSS", level: 92, icon: "fab fa-css3-alt" },
    { name: "Three.js", level: 75, icon: "fas fa-cube" },
  ];

  const backendStack = [
    { name: "Node.js", level: 88, icon: "fab fa-node" },
    { name: "Python", level: 85, icon: "fab fa-python" },
    { name: "PostgreSQL", level: 82, icon: "fas fa-database" },
    { name: "MongoDB", level: 80, icon: "fas fa-leaf" },
  ];

  const toolsStack = [
    { name: "AI/ML Integration", level: 78, icon: "fas fa-brain" },
    { name: "Blockchain/Web3", level: 70, icon: "fas fa-link" },
    { name: "Cloud Platforms", level: 85, icon: "fas fa-cloud" },
    { name: "DevOps", level: 75, icon: "fas fa-tools" },
  ];

  const renderSkillBar = (skill: { name: string; level: number; icon: string }, colorClass: string) => (
    <div key={skill.name} className="mb-5 group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2.5">
           <i className={`${skill.icon} text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors`}></i>
           <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{skill.name}</span>
        </div>
        <span className="text-xs font-mono text-gray-400">{skill.level}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out-expo group-hover:brightness-110 ${colorClass}`}
          style={{ width: `${skill.level}%` }}
        ></div>
      </div>
    </div>
  );

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

        {/* Top Row: Bio + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Biography */}
          <Reveal className="lg:col-span-2 h-full">
            <div className="h-full glass-strong rounded-[2rem] p-8 md:p-10 relative overflow-hidden group flex flex-col justify-center">
               <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                          <i className="fas fa-user-astronaut"></i>
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold">Who I Am</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Developer & Designer</p>
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
                         onClick={() => window.open('assets/cv.pdf', '_blank')}
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-80 transition-opacity"
                      >
                         <i className="fas fa-download"></i> Download CV
                      </button>
                   </div>
               </div>
               
               {/* Decorative Gradient */}
               <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </Reveal>

          {/* Stats */}
           <Reveal delay={200} className="lg:col-span-1 h-full">
            <div className="h-full glass rounded-[2rem] p-8 flex flex-col justify-center gap-6 relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>

               {STATS.map((stat, idx) => (
                  <div key={idx} className="relative z-10 p-4 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
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
        </div>

        {/* Technical Arsenal Section */}
        <Reveal delay={300}>
            <div className="text-center mb-10 mt-16">
                <h3 className="text-3xl font-bold mb-2">My Technical Arsenal</h3>
                <p className="text-gray-500 dark:text-gray-400">A comprehensive toolkit of modern technologies.</p>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Frontend Card */}
            <Reveal delay={400} className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full border-t-4 border-t-blue-500 hover:-translate-y-2 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <i className="fas fa-code"></i>
                        </span>
                        Frontend
                    </h4>
                    {frontendStack.map(skill => renderSkillBar(skill, 'bg-blue-600'))}
                </div>
            </Reveal>

            {/* Backend Card */}
            <Reveal delay={500} className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full border-t-4 border-t-green-500 hover:-translate-y-2 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                            <i className="fas fa-server"></i>
                        </span>
                        Backend
                    </h4>
                    {backendStack.map(skill => renderSkillBar(skill, 'bg-green-600'))}
                </div>
            </Reveal>

            {/* Modern Tech Card */}
            <Reveal delay={600} className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full border-t-4 border-t-purple-500 hover:-translate-y-2 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <i className="fas fa-rocket"></i>
                        </span>
                        Modern Tech
                    </h4>
                    {toolsStack.map(skill => renderSkillBar(skill, 'bg-purple-600'))}
                </div>
            </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;