import React from 'react';

const CV: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  const skills = [
    { category: 'Frontend Architecture', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Framer Motion'], icon: 'fa-layer-group', color: 'blue' },
    { category: 'Backend & Cloud', items: ['Node.js', 'Python', 'Firebase', 'PostgreSQL', 'MongoDB', 'REST APIs'], icon: 'fa-server', color: 'indigo' },
    { category: 'Mobile Systems', items: ['Flutter', 'React Native', 'Mobile UI/UX'], icon: 'fa-mobile-screen-button', color: 'purple' },
    { category: 'DevOps & Tooling', items: ['Git', 'Docker', 'Vercel', 'Postman', 'Figma', 'Linux'], icon: 'fa-terminal', color: 'cyan' }
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#020203] font-sans selection:bg-blue-500/20 transition-colors duration-1000 print:bg-white">
      
      {/* NAVIGATION BAR - Glassmorphism UI */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center print:hidden z-50">
          <button 
             onClick={handleBack}
             className="px-5 py-2.5 rounded-2xl glass-strong hover:bg-white dark:hover:bg-mac-gray text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2 transition-all active:scale-95 text-xs shadow-xl border border-white/20"
          >
             <i className="fas fa-chevron-left text-xs"></i> Return to Terminal
          </button>
          
          <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/30 active:scale-95 text-sm border border-blue-400/20"
              >
                <i className="fas fa-print"></i> Generate PDF
              </button>
          </div>
      </nav>

      <div className="pt-24 pb-20 px-4 md:px-8 print:p-0 print:pt-0">
         <div className="max-w-5xl mx-auto glass-strong rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 dark:border-white/10 print:shadow-none print:rounded-none print:border-none print:max-w-full print:m-0">
            
            {/* CV HEADER - Premium Developer Identity */}
            <header className="relative bg-[#0A0A0C] text-white p-12 md:p-20 overflow-hidden print:bg-white print:text-black print:p-10 print:border-b-4 print:border-black">
                {/* Background Decor - Visual interest for screen */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none print:hidden"></div>
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] print:hidden"></div>
                <div className="absolute top-10 right-10 font-mono text-[8rem] font-bold opacity-[0.03] select-none pointer-events-none print:hidden">{"</>"}</div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] print:hidden">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Active Session: Bhupesh_Bhatt.v2
                        </div>
                        
                        <div className="space-y-2">
                          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] print:text-5xl">
                              Bhupesh Raj <br/>
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 print:text-black">Bhatt.</span>
                          </h1>
                          <p className="text-xl md:text-2xl font-mono text-gray-400 font-medium tracking-tight mt-4">
                            <span className="text-blue-500">const</span> role = <span className="text-purple-400">"Full Stack Architect"</span>;
                          </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-3 text-sm font-medium text-gray-400 print:text-black print:text-xs">
                        <div className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform print:hidden"><i className="fas fa-envelope"></i></div>
                            <a href="mailto:hello@bbhatt.com.np" className="hover:text-white transition-colors">hello@bbhatt.com.np</a>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform print:hidden"><i className="fas fa-globe"></i></div>
                            <a href="https://www.bbhatt.com.np" className="hover:text-white transition-colors">www.bbhatt.com.np</a>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform print:hidden"><i className="fas fa-location-dot"></i></div>
                            <span>Mahendranagar, Nepal</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TWO COLUMN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-gray-200 dark:bg-white/5 print:bg-white print:block">
                
                {/* LEFT SIDE - Profile & Bio */}
                <main className="lg:col-span-8 bg-white dark:bg-[#0C0C0E] p-10 md:p-16 space-y-20 print:p-10">
                    
                    {/* SUMMARY */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
                           Professional Summary <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 leading-[1.4] font-medium tracking-tight">
                          Dedicated <span className="text-blue-600 dark:text-blue-400 font-black">Full Stack Engineer</span> with 2+ years of hands-on experience in engineering performant web architectures. 
                          I bridge the gap between complex backend logic and pixel-perfect user experiences, specializing in <span className="italic">React, Node.js, and Cloud infrastructures</span>. 
                          Passionately committed to clean code, modular design, and solving real-world challenges through code.
                        </p>
                    </section>

                    {/* EXPERIENCE LOGS */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-12 flex items-center gap-4">
                           Experience & Deployments <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                        </h2>
                        
                        <div className="space-y-16">
                            {/* Entry 1 */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-100 dark:bg-white/5"></div>
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                                
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-6">
                                    <div className="space-y-1">
                                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">Full Stack Developer</h3>
                                      <p className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest">Independent / Freelance</p>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">2022 — PRESENT</div>
                                </div>
                                
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                    <li className="flex gap-4">
                                        <span className="text-blue-500 font-mono font-bold mt-1">01</span>
                                        Engineered full-scale SaaS applications using Next.js and Firebase, focusing on real-time data synchronization and scalable authentication.
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-blue-500 font-mono font-bold mt-1">02</span>
                                        Architected custom API solutions in Node.js, reducing payload sizes by 35% through strategic data structuring and caching mechanisms.
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-blue-500 font-mono font-bold mt-1">03</span>
                                        Delivered high-fidelity UI designs for clients in fintech and e-commerce, resulting in an average 20% increase in user retention.
                                    </li>
                                </ul>
                            </div>

                            {/* Entry 2 */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-100 dark:bg-white/5"></div>
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/20"></div>
                                
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-6">
                                    <div className="space-y-1">
                                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">UI/UX Designer & Web Lead</h3>
                                      <p className="text-gray-500 dark:text-gray-400 font-black text-xs uppercase tracking-widest">Aglo Yatri / Startup Projects</p>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">2021 — 2022</div>
                                </div>
                                
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                    <li className="flex gap-4">
                                        <span className="text-gray-400 font-mono font-bold mt-1">01</span>
                                        Spearheaded the design system for a travel-tech startup, creating a cohesive brand identity across mobile and web platforms.
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-gray-400 font-mono font-bold mt-1">02</span>
                                        Developed custom WordPress themes and plugins for local businesses, focusing on SEO performance and accessibility.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* EDUCATION PRINT ONLY AT BOTTOM */}
                    <section className="hidden print:block border-t pt-10">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6">Academic Background</h2>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-black uppercase">BSc. in Computer Science & IT (CSIT)</h3>
                            <p className="text-sm font-medium">Tribhuvan University, Nepal</p>
                          </div>
                          <p className="font-bold text-blue-600">2020 — 2024</p>
                        </div>
                    </section>
                </main>

                {/* RIGHT SIDEBAR - Tech Spec & Education */}
                <aside className="lg:col-span-4 bg-[#F9F9FB] dark:bg-[#09090A] p-10 md:p-12 space-y-16 print:p-10">
                    
                    {/* BENTO SKILLS GRID */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-10 flex items-center gap-3">
                           <span className="w-6 h-px bg-blue-500"></span> Technical Specs
                        </h2>
                        
                        <div className="space-y-10">
                           {skills.map((group, idx) => (
                             <div key={idx} className="space-y-4 group">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg bg-${group.color}-500/10 flex items-center justify-center text-${group.color}-500 shadow-sm border border-${group.color}-500/20`}>
                                      <i className={`fas ${group.icon} text-xs`}></i>
                                   </div>
                                   <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{group.category}</h3>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pl-0">
                                   {group.items.map(skill => (
                                     <span key={skill} className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter transition-all hover:border-blue-500/30 hover:scale-105 cursor-default">
                                        {skill}
                                     </span>
                                   ))}
                                </div>
                             </div>
                           ))}
                        </div>
                    </section>

                    {/* EDUCATION */}
                    <section className="print:hidden">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-10 flex items-center gap-3">
                           <span className="w-6 h-px bg-blue-500"></span> Academic Profile
                        </h2>
                        <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-sm space-y-4 relative overflow-hidden group">
                           <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                           <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-tight">BSc. in Computer Science & IT (CSIT)</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tribhuvan University</p>
                           <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Graduated: 2024</span>
                           </div>
                        </div>
                    </section>

                    {/* LANGUAGES */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-10 flex items-center gap-3">
                           <span className="w-6 h-px bg-blue-500"></span> Communication
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                             { lang: 'English', level: 'Professional Fluency' },
                             { lang: 'Nepali', level: 'Native / Bilingual' },
                             { lang: 'Hindi', level: 'Converational' }
                           ].map(item => (
                             <div key={item.lang} className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-sm">
                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{item.lang}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.level}</span>
                             </div>
                           ))}
                        </div>
                    </section>
                </aside>
            </div>

            {/* CV FOOTER */}
            <footer className="bg-white dark:bg-[#0A0A0C] border-t border-gray-200 dark:border-white/10 p-12 text-center print:p-8 print:border-t-2 print:border-black">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] print:text-black print:tracking-widest">
                   System Verification: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()} — Bhupesh Raj Bhatt — Final Build v.2.5.0
                </p>
            </footer>
         </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .glass-strong { background: white !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; }
          h1, h2, h3, p, span, li, div { color: black !important; background: transparent !important; }
          @page { margin: 0; size: A4; }
          header { background: white !important; color: black !important; padding: 2cm !important; border-bottom: 3px solid black !important; }
          .bg-slate-950, .bg-[#0A0A0C], .bg-[#0C0C0E], .bg-[#F9F9FB], .bg-[#09090A] { background: white !important; }
          .text-blue-400, .text-blue-500, .text-blue-600, .text-indigo-400, .text-purple-400 { color: black !important; text-decoration: underline !important; font-weight: bold !important; }
          .rounded-\\[2\\.5rem\\] { border-radius: 0 !important; }
          aside, main { background: white !important; width: 100% !important; float: none !important; }
          .lg\\:col-span-8, .lg\\:col-span-4 { width: 100% !important; }
          .border-gray-200, .border-white\\/5, .border-white\\/10 { border: none !important; }
          .shadow-2xl, .shadow-sm, .shadow-xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CV;