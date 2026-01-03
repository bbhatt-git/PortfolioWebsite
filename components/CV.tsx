import React from 'react';

const CV: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  const skills = {
    frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'Framer Motion'],
    backend: ['Node.js', 'Python', 'PHP', 'Firebase', 'MongoDB', 'MySQL'],
    mobile: ['Flutter', 'React Native'],
    tools: ['Git', 'Docker', 'Figma', 'Photoshop', 'Postman']
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-500/20 print:bg-white">
      
      {/* TOOLBAR - HIDDEN ON PRINT */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 bg-white/90 backdrop-blur-md flex justify-between items-center print:hidden z-50 border-b border-gray-200 shadow-sm">
          <button 
             onClick={handleBack}
             className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
          >
             <i className="fas fa-arrow-left"></i> Back to Portfolio
          </button>
          <button 
             onClick={handlePrint}
             className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-sm"
          >
             <i className="fas fa-file-pdf"></i> Generate PDF
          </button>
      </nav>

      {/* PAGE WRAPPER */}
      <div className="pt-24 pb-12 px-4 md:px-8 print:p-0 print:pt-0">
         <div className="max-w-5xl mx-auto bg-white shadow-2xl overflow-hidden rounded-3xl print:shadow-none print:rounded-none print:max-w-full print:m-0">
            
            {/* CV HEADER - IMPACTFUL & CLEAN */}
            <header className="bg-slate-900 text-white p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8 print:bg-slate-900 print:text-white print:p-8">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">Bhupesh Raj Bhatt</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="w-12 h-1 bg-blue-500 rounded-full"></span>
                        <p className="text-xl md:text-2xl font-bold text-blue-400 tracking-wide uppercase">Full Stack Architect</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-2 text-sm md:text-right font-medium opacity-90">
                    <p className="flex items-center md:justify-end gap-3"><i className="fas fa-envelope text-blue-400 w-4"></i> hello@bbhatt.com.np</p>
                    <p className="flex items-center md:justify-end gap-3"><i className="fas fa-globe text-blue-400 w-4"></i> www.bbhatt.com.np</p>
                    <p className="flex items-center md:justify-end gap-3"><i className="fas fa-map-marker-alt text-blue-400 w-4"></i> Mahendranagar, Nepal</p>
                    <p className="flex items-center md:justify-end gap-3"><i className="fab fa-github text-blue-400 w-4"></i> github.com/bbhatt-git</p>
                </div>
            </header>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12">
                
                {/* LEFT SIDEBAR - COL 4 */}
                <aside className="lg:col-span-4 bg-slate-50 p-10 space-y-12 border-r border-gray-100 print:col-span-4 print:p-6 print:bg-slate-50">
                    
                    {/* CORE SKILLS */}
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
                           <i className="fas fa-bolt text-blue-500"></i> Competencies
                        </h2>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Frontend', items: skills.frontend },
                                { label: 'Backend', items: skills.backend },
                                { label: 'Mobile', items: skills.mobile },
                                { label: 'Tools', items: skills.tools }
                            ].map((group) => (
                                <div key={group.label}>
                                    <h3 className="text-[10px] font-black uppercase text-slate-800 mb-3">{group.label}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map(item => (
                                            <span key={item} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 print:border-slate-300">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* LANGUAGES */}
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
                           <i className="fas fa-language text-blue-500"></i> Languages
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700">English</span>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-slate-300'}`}></div>)}
                                </div>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700">Nepali</span>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>)}
                                </div>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700">Hindi</span>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>)}
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* EDUCATION */}
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
                           <i className="fas fa-graduation-cap text-blue-500"></i> Education
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-black text-slate-800">BSc. Computer Science</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Tribhuvan University</p>
                                <p className="text-[10px] text-blue-600 font-bold">2020 — 2024</p>
                            </div>
                        </div>
                    </section>
                </aside>

                {/* RIGHT MAIN CONTENT - COL 8 */}
                <main className="lg:col-span-8 p-10 md:p-14 space-y-16 print:col-span-8 print:p-8">
                    
                    {/* PROFESSIONAL SUMMARY */}
                    <section>
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-blue-600"></span> Executive Summary
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base text-justify font-medium">
                            Strategic and technical Full Stack Developer with over 2 years of proven experience in designing, building, and maintaining sophisticated web ecosystems. Expert in bridging the technical gap between complex backend architectures and high-fidelity frontend interfaces. Dedicated to performance optimization, clean code principles, and creating accessible digital experiences that drive user conversion and business growth.
                        </p>
                    </section>

                    {/* CORE EXPERIENCE / PROJECTS */}
                    <section>
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-10 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-blue-600"></span> Signature Projects
                        </h2>
                        
                        <div className="space-y-12">
                            {/* Project 1 */}
                            <div className="relative pl-8 border-l-2 border-slate-100">
                                <div className="absolute top-0 -left-[9px] w-4 h-4 bg-white border-2 border-blue-600 rounded-full"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-none mb-1">E-Commerce Intelligence Suite</h3>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Lead Architect • MERN Stack</p>
                                    </div>
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase">Production Ready</span>
                                </div>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-caret-right text-blue-500 mt-1"></i>
                                        Developed a multi-tenant dashboard featuring real-time analytics with D3.js and Recharts, processing 10k+ data points per second.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-caret-right text-blue-500 mt-1"></i>
                                        Implemented a highly secure authentication layer with JWT and OAuth2, reducing unauthorized access attempts by 99%.
                                    </li>
                                </ul>
                            </div>

                            {/* Project 2 */}
                            <div className="relative pl-8 border-l-2 border-slate-100">
                                <div className="absolute top-0 -left-[9px] w-4 h-4 bg-white border-2 border-blue-600 rounded-full"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-none mb-1">AI Content Engine (SaaS)</h3>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Full Stack Developer • Next.js & OpenAI</p>
                                    </div>
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase">MVP Launch</span>
                                </div>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-caret-right text-blue-500 mt-1"></i>
                                        Architected a serverless content generation platform utilizing Next.js API routes and OpenAI's GPT-4, achieving sub-2s response times.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-caret-right text-blue-500 mt-1"></i>
                                        Integrated Stripe Billing API for automated recurring payments and tiered subscription management.
                                    </li>
                                </ul>
                            </div>

                             {/* Project 3 */}
                             <div className="relative pl-8 border-l-2 border-slate-100">
                                <div className="absolute top-0 -left-[9px] w-4 h-4 bg-white border-2 border-blue-600 rounded-full"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-none mb-1">Omni-Channel Task Manager</h3>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Mobile Lead • Flutter & Firebase</p>
                                    </div>
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase">App Store Live</span>
                                </div>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-caret-right text-blue-500 mt-1"></i>
                                        Built a high-performance cross-platform mobile application with offline-first synchronization using Cloud Firestore.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* VOLUNTEER & COMMUNITY */}
                    <section>
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-blue-600"></span> Community Impact
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <h3 className="text-xs font-black text-slate-800">Open Source</h3>
                                <p className="text-[10px] text-slate-500 mt-1">Active contributor to UI libraries and developer tooling on GitHub.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <h3 className="text-xs font-black text-slate-800">Tech Mentorship</h3>
                                <p className="text-[10px] text-slate-500 mt-1">Helping student developers navigate the MERN stack ecosystem.</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* CV FOOTER */}
            <footer className="bg-slate-50 border-t border-gray-100 p-8 text-center print:bg-white print:p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                   Certified Digital Signature — Valid {new Date().getFullYear()} — Bhupesh Raj Bhatt
                </p>
            </footer>
         </div>
      </div>

      {/* PRINT-SPECIFIC OVERRIDES */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
          h1, h2, h3, p, span, li {
            color: #000 !important;
          }
          .text-blue-400, .text-blue-500, .text-blue-600 {
            color: #2563eb !important; /* Force a dark printable blue */
          }
          .bg-slate-900 {
            background-color: #0f172a !important;
            -webkit-print-color-adjust: exact;
          }
          .bg-slate-50 {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
          }
          header {
            color: white !important;
          }
          header * {
            color: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CV;