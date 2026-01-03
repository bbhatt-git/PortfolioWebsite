import React from 'react';

const CV: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-6 md:p-12 print:p-0 print:overflow-visible">
      
      {/* Navigation - Hidden on Print */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-md flex justify-between items-center print:hidden z-50 border-b border-gray-200">
          <button 
             onClick={handleBack}
             className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center gap-2 transition-colors text-sm"
          >
             <i className="fas fa-arrow-left"></i> Back to Portfolio
          </button>
          <button 
             onClick={handlePrint}
             className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30 text-sm"
          >
             <i className="fas fa-print"></i> Print / Download PDF
          </button>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16 md:h-20 print:hidden"></div>

      {/* Resume Container */}
      <div className="max-w-4xl mx-auto bg-white print:max-w-full">
         
         {/* Header */}
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-gray-900 pb-8 mb-8 gap-4">
             <div>
                 <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2 uppercase">Bhupesh Raj Bhatt</h1>
                 <p className="text-xl text-blue-600 font-bold tracking-wide uppercase">Full Stack Developer</p>
             </div>
             <div className="text-left md:text-right text-sm text-gray-600 space-y-1 font-medium">
                 <p><i className="fas fa-envelope mr-2 text-gray-400"></i>hello@bbhatt.com.np</p>
                 <p><i className="fas fa-globe mr-2 text-gray-400"></i>www.bbhatt.com.np</p>
                 <p><i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>Mahendranagar, Nepal</p>
                 <p><i className="fab fa-github mr-2 text-gray-400"></i>github.com/bbhatt-git</p>
             </div>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
             
             {/* Left Column */}
             <div className="md:col-span-2 space-y-10">
                 
                 {/* Profile */}
                 <section>
                     <h2 className="text-lg font-black uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 text-gray-400 flex items-center gap-2">
                         <i className="fas fa-user-circle"></i> Profile
                     </h2>
                     <p className="text-gray-700 leading-relaxed text-sm md:text-base text-justify">
                         Passionate and results-driven Full Stack Developer with experience in building pixel-perfect, accessible, and performant web applications. Skilled in the MERN stack, Next.js, and modern UI libraries. Adept at bridging the gap between design and technology to deliver seamless user experiences. Strong problem-solving abilities and a continuous learner.
                     </p>
                 </section>

                 {/* Projects */}
                 <section>
                     <h2 className="text-lg font-black uppercase tracking-widest border-b border-gray-200 pb-2 mb-6 text-gray-400 flex items-center gap-2">
                         <i className="fas fa-code-branch"></i> Key Projects
                     </h2>
                     
                     <div className="space-y-6">
                         <div>
                             <div className="flex justify-between items-baseline mb-1">
                                 <h3 className="font-bold text-lg text-gray-900">E-Commerce Dashboard</h3>
                                 <a href="#" className="text-xs text-blue-600 hover:underline print:hidden">View Live</a>
                             </div>
                             <p className="text-sm text-gray-500 mb-2 font-mono">React, Node.js, MongoDB, Tailwind CSS</p>
                             <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                 <li>Built a comprehensive admin dashboard with real-time data visualization using Recharts.</li>
                                 <li>Implemented role-based authentication and secure API endpoints.</li>
                                 <li>Optimized database queries reducing load times by 40%.</li>
                             </ul>
                         </div>

                         <div>
                             <div className="flex justify-between items-baseline mb-1">
                                 <h3 className="font-bold text-lg text-gray-900">AI Content Generator</h3>
                                 <a href="#" className="text-xs text-blue-600 hover:underline print:hidden">View Live</a>
                             </div>
                             <p className="text-sm text-gray-500 mb-2 font-mono">Next.js, OpenAI API, Firebase</p>
                             <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                 <li>Developed a SaaS platform helping users generate marketing copy via AI.</li>
                                 <li>Integrated Stripe for subscription payments and usage tracking.</li>
                                 <li>Designed a responsive, accessible UI with dark mode support.</li>
                             </ul>
                         </div>
                         
                         <div>
                             <div className="flex justify-between items-baseline mb-1">
                                 <h3 className="font-bold text-lg text-gray-900">Task Management App</h3>
                                 <a href="#" className="text-xs text-blue-600 hover:underline print:hidden">View Live</a>
                             </div>
                             <p className="text-sm text-gray-500 mb-2 font-mono">Flutter, Firebase</p>
                             <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                 <li>Created a cross-platform mobile application for task tracking.</li>
                                 <li>Implemented offline capabilities and local notifications.</li>
                                 <li>Achieved 4.8/5 stars on user testing for intuitive UX.</li>
                             </ul>
                         </div>
                     </div>
                 </section>

                 {/* Education */}
                 <section>
                     <h2 className="text-lg font-black uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 text-gray-400 flex items-center gap-2">
                         <i className="fas fa-graduation-cap"></i> Education
                     </h2>
                     <div className="mb-4">
                         <div className="flex justify-between items-baseline">
                             <h3 className="font-bold text-gray-900">Bachelor in Computer Science</h3>
                             <span className="text-sm font-bold text-gray-500">2020 - 2024</span>
                         </div>
                         <p className="text-sm text-gray-600">Tribhuvan University, Nepal</p>
                     </div>
                 </section>
             </div>

             {/* Right Column */}
             <div className="space-y-10">
                 
                 {/* Skills */}
                 <section>
                     <h2 className="text-lg font-black uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 text-gray-400 flex items-center gap-2">
                         <i className="fas fa-tools"></i> Skills
                     </h2>
                     
                     <div className="mb-6">
                         <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Frontend</h3>
                         <div className="flex flex-wrap gap-2">
                             {['React', 'Next.js', 'TypeScript', 'Tailwind', 'HTML5/CSS3', 'Framer Motion'].map(s => (
                                 <span key={s} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 print:border print:border-gray-300">{s}</span>
                             ))}
                         </div>
                     </div>

                     <div className="mb-6">
                         <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Backend</h3>
                         <div className="flex flex-wrap gap-2">
                             {['Node.js', 'Express', 'Python', 'Firebase', 'PostgreSQL', 'MongoDB'].map(s => (
                                 <span key={s} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 print:border print:border-gray-300">{s}</span>
                             ))}
                         </div>
                     </div>

                     <div className="mb-6">
                         <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Tools</h3>
                         <div className="flex flex-wrap gap-2">
                             {['Git', 'Docker', 'Figma', 'VS Code', 'Postman'].map(s => (
                                 <span key={s} className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 print:border print:border-gray-300">{s}</span>
                             ))}
                         </div>
                     </div>
                 </section>

                 {/* Languages */}
                 <section>
                     <h2 className="text-lg font-black uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 text-gray-400 flex items-center gap-2">
                         <i className="fas fa-language"></i> Languages
                     </h2>
                     <ul className="space-y-2 text-sm text-gray-700">
                         <li className="flex justify-between">
                             <span>English</span>
                             <span className="font-semibold text-gray-500">Professional</span>
                         </li>
                         <li className="flex justify-between">
                             <span>Nepali</span>
                             <span className="font-semibold text-gray-500">Native</span>
                         </li>
                         <li className="flex justify-between">
                             <span>Hindi</span>
                             <span className="font-semibold text-gray-500">Fluent</span>
                         </li>
                     </ul>
                 </section>
                 
                 {/* Interests */}
                 <section>
                     <h2 className="text-lg font-black uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 text-gray-400 flex items-center gap-2">
                         <i className="fas fa-heart"></i> Interests
                     </h2>
                     <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                         <span className="px-3 py-1 rounded-full border border-gray-200">Open Source</span>
                         <span className="px-3 py-1 rounded-full border border-gray-200">UI Design</span>
                         <span className="px-3 py-1 rounded-full border border-gray-200">AI/ML</span>
                         <span className="px-3 py-1 rounded-full border border-gray-200">Gaming</span>
                     </div>
                 </section>

             </div>
         </div>

         {/* Footer */}
         <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 print:mt-6">
             <p>&copy; {new Date().getFullYear()} Bhupesh Raj Bhatt. All rights reserved.</p>
         </div>

      </div>
    </div>
  );
};

export default CV;