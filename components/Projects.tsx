import React, { useState, useRef, useEffect } from 'react';
import Reveal from './Reveal';
import { Project } from '../types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; 
    const y = (e.clientY - top - height / 2) / 25; 
    const glareX = ((e.clientX - left) / width) * 100;
    const glareY = ((e.clientY - top) / height) * 100;
    setRotate({ x: -y, y: x });
    setGlare({ x: glareX, y: glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const displayUrl = project.liveUrl 
    ? project.liveUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') 
    : 'project.local';

  return (
    <div 
      ref={cardRef}
      className="group relative rounded-[24px] transition-all duration-500 ease-out-expo transform-gpu preserve-3d h-full perspective-1000 cursor-pointer"
      style={{ transform: isTouch ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div 
        className="absolute inset-0 rounded-[24px] z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, transparent 80%)`,
          opacity: glare.opacity * 0.6,
        }}
      ></div>

      <div className="bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl rounded-[24px] overflow-hidden shadow-2xl dark:shadow-black/50 border border-white/40 dark:border-white/5 relative z-10 flex flex-col h-full transition-transform duration-500 preserve-3d"
           style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)' }}>
        
        {/* Safari Bar */}
        <div className="h-[48px] bg-gray-100/40 dark:bg-[#1E1E20]/40 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-3 shrink-0 preserve-3d relative">
          <div className="flex items-center gap-3 w-[70px] md:w-[100px] shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#28C840]"></div>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-2 min-w-0">
             <div className="flex items-center justify-center px-4 py-1.5 rounded-lg bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 w-fit max-w-full shadow-sm backdrop-blur-md">
               <div className="flex items-center gap-2">
                 <i className="fas fa-lock text-[8px] md:text-[9px] text-gray-400 opacity-70"></i>
                 <span className="text-[9px] md:text-[10px] font-semibold text-gray-600 dark:text-gray-400 tracking-tight whitespace-nowrap select-none">
                   {displayUrl}
                 </span>
               </div>
             </div>
          </div>

          <div className="w-[70px] md:w-[100px] shrink-0"></div>
        </div>

        <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-black shrink-0 overflow-hidden border-b border-gray-100 dark:border-white/5 group-hover:shadow-inner">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
             <span className="px-6 py-2.5 rounded-full bg-white/10 text-white font-bold text-sm backdrop-blur-md border border-white/20 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">View Details</span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1 bg-white/50 dark:bg-[#161618]/50">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{project.title}</h3>
            <div className="flex gap-2">
               {project.codeUrl && (
                  <button onClick={(e) => { e.stopPropagation(); window.open(project.codeUrl, '_blank'); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all hover:scale-110">
                    <i className="fab fa-github text-sm"></i>
                  </button>
               )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium mb-6 flex-1">{project.desc}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
             {project.stack.split('•').slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/5">{tech.trim()}</span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "projects"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects: ", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const navigateToNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % projects.length;
    setSelectedProject(projects[nextIndex]);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="work" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col items-center mb-20 text-center">
             <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">Selected Work</h2>
             <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"></div>
             <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl">A collection of projects crafted with precision and passion.</p>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 150} className="h-full">
                <ProjectCard project={project} onClick={() => openModal(project)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <i className="fas fa-folder-open text-4xl mb-4 opacity-20"></i>
            <p className="text-xl font-medium">No projects found in the database.</p>
          </div>
        )}
      </div>

      {selectedProject && (
        <div 
          ref={scrollContainerRef}
          className="fixed inset-0 z-[100] bg-white dark:bg-[#050505] overflow-y-auto overflow-x-hidden animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)]"
        >
          {/* Header Action Bar */}
          <div className="sticky top-0 z-[110] flex items-center justify-between px-6 md:px-12 py-6 pointer-events-none">
            <button 
              onClick={closeModal} 
              className="pointer-events-auto group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform group-hover:-translate-x-1">
                <i className="fas fa-arrow-left text-[10px]"></i>
              </div>
              <span className="text-sm font-bold tracking-tight text-black dark:text-white">Close Project</span>
            </button>

            <div className="hidden md:flex gap-4 pointer-events-auto">
              {selectedProject.liveUrl && (
                <a href={selectedProject.liveUrl} target="_blank" className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
                  Live Preview
                </a>
              )}
            </div>
          </div>

          <div className="relative">
            {/* HERO SECTION */}
            <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
               <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
               <img 
                 src={selectedProject.image} 
                 alt={selectedProject.title} 
                 className="w-full h-full object-cover object-top animate-[scaleIn_1.4s_cubic-bezier(0.16,1,0.3,1)] scale-110" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent z-20"></div>
            </div>

            {/* CONTENT CONTAINER */}
            <div className="container mx-auto px-6 md:px-12 -mt-48 md:-mt-64 relative z-30 pb-32">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
                
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-16">
                   
                   {/* Project Identity Card */}
                   <Reveal variant="3d">
                     <div className="glass-strong rounded-[3rem] p-10 md:p-16 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] dark:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.6)] border border-white/60 dark:border-white/10">
                        <div className="mb-10">
                           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-500/20">
                             Featured Project
                           </div>
                           <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-black dark:text-white mb-8 leading-[0.85] animate-fade-up">
                             {selectedProject.title}
                           </h1>
                           <div className="flex flex-wrap gap-2 md:gap-4">
                              {selectedProject.stack.split('•').map((tech, i) => (
                                <span key={i} className="px-5 py-2.5 rounded-2xl bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-xs font-black tracking-tight uppercase">
                                  {tech.trim()}
                                </span>
                              ))}
                           </div>
                        </div>
                        
                        <div className="h-px w-full bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent mb-12"></div>

                        <div className="space-y-8">
                           <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white flex items-center gap-4">
                              <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-lg shadow-blue-500/40"><i className="fas fa-align-left"></i></span>
                              Introduction
                           </h2>
                           <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light italic">
                              "{selectedProject.desc}"
                           </p>
                        </div>
                     </div>
                   </Reveal>

                   {/* Case Study Sections (Conditional) */}
                   {selectedProject.caseStudy && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <Reveal delay={150}>
                           <div className="glass rounded-[2.5rem] p-10 md:p-12 border border-white/50 dark:border-white/10 h-full group hover:bg-white/90 dark:hover:bg-white/5 transition-all duration-700">
                              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl mb-8 group-hover:scale-110 transition-transform">
                                 <i className="fas fa-mountain"></i>
                              </div>
                              <h3 className="text-2xl font-bold mb-6 text-black dark:text-white tracking-tight">The Challenge</h3>
                              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-lg">
                                 {selectedProject.caseStudy.challenge}
                              </p>
                           </div>
                        </Reveal>

                        <Reveal delay={250}>
                           <div className="glass rounded-[2.5rem] p-10 md:p-12 border border-white/50 dark:border-white/10 h-full group hover:bg-white/90 dark:hover:bg-white/5 transition-all duration-700">
                              <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl mb-8 group-hover:scale-110 transition-transform">
                                 <i className="fas fa-lightbulb"></i>
                              </div>
                              <h3 className="text-2xl font-bold mb-6 text-black dark:text-white tracking-tight">The Solution</h3>
                              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-lg">
                                 {selectedProject.caseStudy.solution}
                              </p>
                           </div>
                        </Reveal>
                     </div>
                   )}

                   {/* Next Project Hook */}
                   <Reveal delay={350}>
                      <div 
                        onClick={navigateToNextProject}
                        className="group relative rounded-[3rem] p-12 md:p-20 bg-black dark:bg-white text-white dark:text-black overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 hover:scale-[1.01]"
                      >
                         <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="text-center md:text-left">
                               <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 opacity-60">Up Next</h4>
                               <p className="text-3xl md:text-5xl font-bold tracking-tighter">Discover more projects</p>
                            </div>
                            <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-white dark:group-hover:bg-black group-hover:text-black dark:group-hover:text-white transition-all duration-500 group-hover:rotate-45">
                               <i className="fas fa-arrow-right text-2xl"></i>
                            </div>
                         </div>
                      </div>
                   </Reveal>
                </div>

                {/* Sticky Side Panels */}
                <div className="lg:col-span-4 space-y-8">
                   <Reveal delay={450}>
                      <div className="lg:sticky lg:top-32 space-y-8">
                        <div className="glass-strong rounded-[2.5rem] p-10 border border-white/60 dark:border-white/10 shadow-2xl backdrop-blur-3xl">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-10">Take Action</h4>
                           <div className="space-y-5">
                              {selectedProject.liveUrl && (
                                 <a 
                                   href={selectedProject.liveUrl} 
                                   target="_blank" 
                                   className="group flex items-center justify-between w-full px-8 py-6 rounded-2xl bg-blue-600 text-white font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
                                 >
                                    <span className="flex items-center gap-4 text-sm tracking-tight">Visit Live <i className="fas fa-external-link-alt text-[10px] opacity-70"></i></span>
                                    <i className="fas fa-chevron-right text-xs group-hover:translate-x-2 transition-transform"></i>
                                 </a>
                              )}
                              {selectedProject.codeUrl && (
                                 <a 
                                   href={selectedProject.codeUrl} 
                                   target="_blank" 
                                   className="group flex items-center justify-between w-full px-8 py-6 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-black dark:text-white font-bold transition-all hover:bg-gray-50 dark:hover:bg-white/20 active:scale-95"
                                 >
                                    <span className="flex items-center gap-4 text-sm tracking-tight">Source Code <i className="fab fa-github"></i></span>
                                    <i className="fas fa-chevron-right text-xs group-hover:translate-x-2 transition-transform"></i>
                                 </a>
                              )}
                              {!selectedProject.liveUrl && !selectedProject.codeUrl && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">Private repository or internal project.</p>
                              )}
                           </div>
                        </div>
                      </div>
                   </Reveal>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;