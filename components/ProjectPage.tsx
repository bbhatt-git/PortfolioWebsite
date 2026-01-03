import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import Layout from './Layout';
import Footer from './Footer';
import Reveal from './Reveal';

const ProjectPage: React.FC<{ id: string }> = ({ id }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(data);
          // Update window title
          document.title = `${data.title} | Bhupesh Bhatt Portfolio`;
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.title = "Bhupesh Bhatt | Senior Full Stack Developer & UI/UX Designer";
    };
  }, [id]);

  const handleBack = () => {
    window.location.hash = '#work';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Loading Repository...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-8xl font-black mb-4 text-gray-200 dark:text-white/10">404</h1>
        <p className="text-gray-500 mb-8 font-medium">This asset has been purged from the database.</p>
        <button onClick={handleBack} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Return to Work</button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="bg-[#F2F2F7] dark:bg-[#050505] min-h-screen transition-colors duration-1000">
        
        {/* Fixed Header / Nav */}
        <nav className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <button 
              onClick={handleBack} 
              className="w-12 h-12 rounded-2xl glass-strong border border-white/40 dark:border-white/10 flex items-center justify-center text-black dark:text-white shadow-xl hover:scale-110 transition-transform active:scale-95 group"
            >
              <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            </button>
            
            <div className={`transition-all duration-500 flex items-center gap-4 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
               <div className="h-10 px-6 rounded-full glass-strong border border-white/40 dark:border-white/10 flex items-center shadow-lg">
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-xs">{project.title}</span>
               </div>
            </div>

            <div className="w-12 hidden md:block"></div> {/* Spacer for symmetry */}
          </div>
        </nav>

        {/* Immersive Hero Section */}
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F2F2F7] dark:to-[#050505] z-10"></div>
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover object-center animate-scale-in" 
          />
          
          <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-6 pb-12 md:pb-24">
            <Reveal variant="skew-up" triggerOnMount>
               <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl">
                 {project.title}
               </h1>
            </Reveal>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 md:px-12 pb-32">
          <div className="max-w-6xl mx-auto">
            
            {/* Metadata Bar */}
            <Reveal variant="fade" delay={200} triggerOnMount>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-white/5 rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/5 mb-16 shadow-2xl">
                  <div className="bg-white/80 dark:bg-[#121212]/80 p-8 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{project.category || 'Product Development'}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-[#121212]/80 p-8 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Role</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">Full Stack Lead</p>
                  </div>
                  <div className="bg-white/80 dark:bg-[#121212]/80 p-8 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Year</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">2024</p>
                  </div>
                  <div className="bg-white/80 dark:bg-[#121212]/80 p-8 backdrop-blur-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <p className="text-sm font-bold text-green-500 uppercase flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Production
                    </p>
                  </div>
               </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               {/* Description */}
               <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-4">
                       Project Narrative <span className="flex-1 h-px bg-gray-200 dark:bg-white/5"></span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                       {project.desc}
                    </p>
                  </section>

                  {project.highlights && project.highlights.length > 0 && (
                    <section>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-4">
                         Key Performance <span className="flex-1 h-px bg-gray-200 dark:bg-white/5"></span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {project.highlights.map((h, i) => (
                          <div key={i} className="flex gap-4 p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/5 shadow-sm group hover:scale-[1.02] transition-transform">
                             <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <i className="fas fa-check"></i>
                             </div>
                             <div>
                                <p className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{h}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Validated metric through testing</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
               </div>

               {/* Links & Stack Sidebar */}
               <aside className="space-y-12">
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">Access Points</h2>
                    <div className="flex flex-col gap-4">
                       {project.liveUrl && (
                         <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="w-full py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-center text-sm shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group tracking-widest uppercase">
                            Preview Production <i className="fas fa-external-link-alt text-[10px] group-hover:rotate-12 transition-transform"></i>
                         </a>
                       )}
                       {project.codeUrl && (
                         <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="w-full py-5 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 text-black dark:text-white font-black text-center text-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group tracking-widest uppercase">
                            Source Protocol <i className="fab fa-github text-lg group-hover:scale-110 transition-transform"></i>
                         </a>
                       )}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">Technology Arsenal</h2>
                    <div className="flex flex-wrap gap-2">
                       {project.stack.split(/[•,]/).map((tech, i) => (
                         <span key={i} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest">
                           {tech.trim()}
                         </span>
                       ))}
                    </div>
                  </section>
               </aside>
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-32 pt-16 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
               <button onClick={handleBack} className="group flex items-center gap-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  <div className="w-14 h-14 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <i className="fas fa-arrow-left"></i>
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest">Go Back</p>
                     <p className="text-lg font-bold">To Projects Archive</p>
                  </div>
               </button>

               <a href="#contact" className="group flex items-center gap-4 text-gray-400 hover:text-blue-600 transition-colors">
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest">Next Step</p>
                     <p className="text-lg font-bold">Start a Similar Project</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/20">
                     <i className="fas fa-envelope"></i>
                  </div>
               </a>
            </div>

          </div>
        </div>
        <Footer />
      </div>
    </Layout>
  );
};

export default ProjectPage;