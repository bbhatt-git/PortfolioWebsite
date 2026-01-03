import React from 'react';

const CV: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('pushstate'));
  };

  const skills = [
    { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'] },
    { category: 'Backend', items: ['Node.js', 'Python', 'Firebase', 'PostgreSQL', 'REST APIs'] },
    { category: 'Mobile', items: ['Flutter', 'React Native', 'Mobile UI/UX'] },
    { category: 'Tools', items: ['Git', 'Docker', 'Figma', 'Linux', 'Vercel'] }
  ];

  return (
    <div className="min-h-screen bg-[#F0F0F2] dark:bg-[#050505] font-sans text-gray-900 dark:text-gray-100 p-4 md:p-8 print:p-0 print:bg-white">
      
      {/* NAVIGATION BAR - Minimal */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center print:hidden z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <button 
                onClick={handleHome}
                className="px-5 py-2.5 rounded-full bg-white shadow-sm hover:shadow-md dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 font-medium flex items-center gap-2 transition-all active:scale-95 text-sm border border-gray-200 dark:border-white/10"
            >
                <i className="fas fa-arrow-left text-xs"></i> Home
            </button>
          </div>
          
          <div className="pointer-events-auto">
              <button 
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium flex items-center gap-2 transition-all active:scale-95 text-sm shadow-sm"
              >
                <i className="fas fa-print"></i> Save PDF
              </button>
          </div>
      </nav>

      {/* CV CONTAINER - Clean Paper Look */}
      <div className="max-w-[850px] mx-auto bg-white dark:bg-[#111] shadow-lg md:my-10 md:rounded-lg overflow-hidden border border-gray-100 dark:border-[#222] print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* HEADER */}
        <header className="px-8 py-10 md:px-12 md:py-12 border-b border-gray-100 dark:border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-2">Bhupesh Raj Bhatt</h1>
                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium">Full Stack Architect & Designer</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mahendranagar, Nepal</p>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-gray-100 dark:divide-white/5">
            
            {/* LEFT COLUMN - Main Content */}
            <main className="md:col-span-2 p-8 md:p-12 space-y-10">
                
                {/* SUMMARY */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">About</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        Dedicated Full Stack Engineer with 2+ years of experience engineering high-performance web architectures. 
                        I specialize in bridging complex backend logic with pixel-perfect user interfaces using React, Node.js, and Cloud technologies. 
                        Passionate about clean code, modular design, and building scalable digital products.
                    </p>
                </section>

                {/* EXPERIENCE */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Experience</h3>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Full Stack Developer</h4>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">2022 — Present</span>
                            </div>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">Independent / Freelance</p>
                            <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed marker:text-gray-300">
                                <li>Engineered full-scale SaaS applications using Next.js and Firebase, focusing on real-time synchronization.</li>
                                <li>Architected custom API solutions in Node.js, reducing payload sizes by 35% through data optimization.</li>
                                <li>Delivered high-fidelity UI designs resulting in measurable increases in user retention for fintech clients.</li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">UI/UX Designer & Web Lead</h4>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">2021 — 2022</span>
                            </div>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">Aglo Yatri / Startups</p>
                            <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed marker:text-gray-300">
                                <li>Spearheaded design systems creating cohesive brand identities across mobile and web platforms.</li>
                                <li>Developed custom, high-performance WordPress themes focusing on SEO and accessibility.</li>
                            </ul>
                        </div>
                    </div>
                </section>

            </main>

            {/* RIGHT COLUMN - Sidebar Info */}
            <aside className="p-8 md:p-12 bg-gray-50 dark:bg-[#161616] space-y-10">
                
                {/* CONTACT */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contact</h3>
                    <ul className="space-y-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <li>
                            <a href="mailto:hello@bbhatt.com.np" className="hover:text-blue-600 transition-colors flex items-center gap-3">
                                <i className="fas fa-envelope text-gray-400 w-4"></i> hello@bbhatt.com.np
                            </a>
                        </li>
                        <li>
                            <a href="https://bbhatt.com.np" className="hover:text-blue-600 transition-colors flex items-center gap-3">
                                <i className="fas fa-globe text-gray-400 w-4"></i> bbhatt.com.np
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/bbhatt-git" className="hover:text-blue-600 transition-colors flex items-center gap-3">
                                <i className="fab fa-github text-gray-400 w-4"></i> bbhatt-git
                            </a>
                        </li>
                        <li>
                            <span className="flex items-center gap-3 text-gray-500">
                                <i className="fas fa-map-marker-alt text-gray-400 w-4"></i> Nepal
                            </span>
                        </li>
                    </ul>
                </section>

                {/* SKILLS */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Technical Skills</h3>
                    <div className="space-y-4">
                        {skills.map((group, idx) => (
                            <div key={idx}>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">{group.category}</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {group.items.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 rounded text-[10px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* EDUCATION */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">BSc. CSIT</h4>
                        <p className="text-xs text-gray-500 mt-1">Tribhuvan University</p>
                        <p className="text-xs text-gray-400 mt-1">Graduated 2024</p>
                    </div>
                </section>

                {/* LANGUAGES */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Languages</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex justify-between"><span>English</span> <span className="text-gray-400">Fluent</span></li>
                        <li className="flex justify-between"><span>Nepali</span> <span className="text-gray-400">Native</span></li>
                        <li className="flex justify-between"><span>Hindi</span> <span className="text-gray-400">Conversational</span></li>
                    </ul>
                </section>

            </aside>
        </div>
      </div>
    </div>
  );
};

export default CV;