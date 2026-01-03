import React from 'react';

const CV: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  const skills = {
    frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Vite', 'Framer Motion'],
    backend: ['Node.js', 'Python', 'PHP', 'Firebase', 'MongoDB', 'PostgreSQL'],
    mobile: ['Flutter', 'React Native'],
    tools: ['Git', 'Docker', 'Figma', 'AWS', 'Vercel']
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] font-sans selection:bg-blue-500/20 print:bg-white transition-colors duration-1000">
      
      {/* TOOLBAR - High-end Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center print:hidden z-50">
          <button 
             onClick={handleBack}
             className="px-5 py-2.5 rounded-2xl glass-strong hover:bg-white dark:hover:bg-mac-gray text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2 transition-all active:scale-95 text-sm shadow-xl"
          >
             <i className="fas fa-chevron-left text-xs"></i> Exit
          </button>
          
          <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/30 active:scale-95 text-sm"
              >
                <i className="fas fa-download"></i> Save as PDF
              </button>
          </div>
      </nav>

      {/* PAGE WRAPPER */}
      <div className="pt-24 pb-20 px-4 md:px-8 print:p-0 print:pt-0">
         <div className="max-w-5xl mx-auto glass-strong rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-full print:m-0 border border-white/40 dark:border-white/10">
            
            {/* CV HEADER - Tech-forward and Premium */}
            <header className="relative bg-slate-950 text-white p-10 md:p-16 overflow-hidden print:bg-white print:text-black print:p-8 print:border-b-2 print:border-black">
                {/* Decorative Background for screen only */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none print:hidden"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl print:hidden"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest print:hidden">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            System: Online
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] print:text-4xl">
                            Bhupesh Raj <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 print:text-black">Bhatt</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-mono text-gray-400 font-medium">{'// Full Stack Software Architect'}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm font-medium text-gray-400 print:text-black print:text-xs">
                        <a href="mailto:hello@bbhatt.com.np" className="flex items-center gap-3 hover:text-white transition-colors">
                            <i className="fas fa-envelope text-blue-500 w-4"></i> hello@bbhatt.com.np
                        </a>
                        <a href="https://bbhatt.com.np" className="flex items-center gap-3 hover:text-white transition-colors">
                            <i className="fas fa-link text-blue-500 w-4"></i> bbhatt.com.np
                        </a>
                        <div className="flex items-center gap-3">
                            <i className="fas fa-map-pin text-blue-500 w-4"></i> Mahendranagar, Nepal
                        </div>
                        <div className="flex gap-4 pt-2 print:hidden">
                            <a href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><i className="fab fa-github"></i></a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-gray-200 dark:bg-white/5 print:bg-white">
                
                {/* SIDEBAR - Technical Specs */}
                <aside className="lg:col-span-4 bg-white/50 dark:bg-black/20 p-8 md:p-12 space-y-12 print:col-span-4 print:p-6 print:bg-white">
                    
                    {/* SKILL RADAR */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-2">
                           <span className="w-4 h-[1px] bg-blue-500"></span> Technical Stack
                        </h2>
                        
                        <div className="space-y-8">
                            {[
                                { label: 'Frontend Engine', items: skills.frontend, icon: 'fa-code' },
                                { label: 'Backend Systems', items: skills.backend, icon: 'fa-server' },
                                { label: 'Mobile Deployment', items: skills.mobile, icon: 'fa-mobile-alt' },
                                { label: 'Cloud & Tooling', items: skills.tools, icon: 'fa-terminal' }
                            ].map((group) => (
                                <div key={group.label} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <i className={`fas ${group.icon} text-gray-400 text-xs`}></i>
                                        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">{group.label}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.items.map(item => (
                                            <span key={item} className="px-2.5 py-1 rounded-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* EDUCATION PROTOCOL */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-2">
                           <span className="w-4 h-[1px] bg-blue-500"></span> Education
                        </h2>
                        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase">BSc. CSIT</h3>
                            <p className="text-[10px] text-gray-500 font-bold mt-1">Tribhuvan University</p>
                            <p className="text-[10px] text-blue-600 font-black mt-2">2020 — 2024</p>
                        </div>
                    </section>

                    {/* LANGUAGES */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-2">
                           <span className="w-4 h-[1px] bg-blue-500"></span> Localized
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {['English', 'Nepali', 'Hindi'].map(lang => (
                                <div key={lang} className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center border border-gray-200 dark:border-white/5 uppercase">
                                    {lang}
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>

                {/* MAIN CONTENT - Deployment Log */}
                <main className="lg:col-span-8 bg-white dark:bg-[#0c0c0e] p-8 md:p-16 space-y-20 print:col-span-8 print:p-8">
                    
                    {/* MISSION STATEMENT */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
                            Mission Statement <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                        </h2>
                        <p className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 leading-snug">
                            Strategic Full Stack Engineer with 2+ years of experience building <span className="text-blue-600 dark:text-blue-400 font-black underline decoration-2 decoration-blue-500/30 underline-offset-4">scalable digital products</span>. 
                            Focused on high-performance architectures, clean code modularity, and pixel-perfect UI execution.
                        </p>
                    </section>

                    {/* PROJECT LOGS */}
                    <section className="space-y-12">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-10 flex items-center gap-3">
                            Signature Deployments <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                        </h2>
                        
                        <div className="space-y-16">
                            {/* Project 1 */}
                            <div className="group relative">
                                <div className="absolute -left-8 md:-left-12 top-1 h-full w-[2px] bg-gray-100 dark:bg-white/5 hidden md:block"></div>
                                <div className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 rounded-full bg-white dark:bg-mac-gray border-4 border-blue-600 hidden md:flex items-center justify-center">
                                     <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">E-Commerce Intelligence Platform</h3>
                                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">Stack: React • Node.js • MongoDB</p>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2023 — Present</div>
                                </div>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                                    <li className="flex gap-3">
                                        <span className="text-blue-500 font-mono font-bold">$</span>
                                        Built a real-time inventory synchronization engine handling 15,000+ SKUs across multiple vendors using WebSockets.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-blue-500 font-mono font-bold">$</span>
                                        Optimized server-side rendering for a 40% improvement in first-contentful paint (FCP) across mobile devices.
                                    </li>
                                </ul>
                            </div>

                            {/* Project 2 */}
                            <div className="group relative">
                                <div className="absolute -left-8 md:-left-12 top-1 h-full w-[2px] bg-gray-100 dark:bg-white/5 hidden md:block"></div>
                                <div className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 rounded-full bg-white dark:bg-mac-gray border-4 border-gray-200 dark:border-white/10 hidden md:flex items-center justify-center group-hover:border-blue-500 transition-colors">
                                     <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 group-hover:bg-blue-500 transition-colors rounded-full"></div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">AI Content Distribution Engine</h3>
                                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">Stack: Next.js • OpenAI • Firebase</p>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2022 — 2023</div>
                                </div>
                                <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                                    <li className="flex gap-3">
                                        <span className="text-blue-500 font-mono font-bold">$</span>
                                        Integrated advanced GPT-4 prompting pipelines to automate marketing copy generation for 200+ active SaaS users.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* TECHNICAL PHILOSOPHY */}
                    <section className="pt-10 border-t border-gray-100 dark:border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-4 tracking-tighter">Code Philosophy</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                    "I believe in building software that is as maintainable as it is performant. Every line of code should serve the user experience while respecting the system's resource limits."
                                </p>
                            </div>
                            <div className="flex items-center justify-end print:hidden">
                                <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center p-2 relative">
                                    <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin-slow"></div>
                                    <i className="fas fa-terminal text-2xl text-blue-500"></i>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* CV FOOTER */}
            <footer className="bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 p-10 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">
                   System Verification Hash: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()} — BHUPESH RAJ BHATT — v.2.5.0
                </p>
            </footer>
         </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .glass-strong { background: white !important; border: none !important; box-shadow: none !important; }
          h1, h2, h3, p, span { color: black !important; }
          @page { margin: 1cm; size: A4; }
          header { background: white !important; border-bottom: 2px solid black !important; color: black !important; }
          .bg-slate-950 { background: white !important; }
          .text-blue-400, .text-blue-500, .text-blue-600 { color: #2563eb !important; }
          .rounded-\\[2\\.5rem\\] { rounded: 0 !important; }
          aside, main { background: white !important; }
          .print\\:border-b-2 { border-bottom-width: 2px !important; }
        }
      `}</style>
    </div>
  );
};

export default CV;