import React, { useState, useRef, useEffect } from 'react';
import Reveal from './Reveal';
import { PROJECTS as STATIC_PROJECTS } from '../constants';
import { Project } from '../types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// Helper to calculate tilt
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

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Format URL for display (remove https:// and trailing slashes)
  const displayUrl = project.liveUrl 
    ? project.liveUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') 
    : 'project.local';

  return (
    <div 
      ref={cardRef}
      className="group relative rounded-[24px] transition-all duration-500 ease-out-expo transform-gpu preserve-3d h-full perspective-1000 cursor-pointer"
      style={{
        transform: isTouch ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Dynamic Glare Overlay */}
      <div 
        className="absolute inset-0 rounded-[24px] z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, transparent 80%)`,
          opacity: glare.opacity * 0.6,
        }}
      ></div>

      {/* Main Card Container */}
      <div className="bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl rounded-[24px] overflow-hidden shadow-2xl dark:shadow-black/50 border border-white/40 dark:border-white/5 relative z-10 flex flex-col h-full transition-transform duration-500 preserve-3d"
           style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)' }}
      >
        {/* macOS / Safari Title Bar - Redesigned to prevent overlap */}
        <div className="h-[48px] bg-gray-100/40 dark:bg-[#1E1E20]/40 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 shrink-0 preserve-3d relative"
             style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)' }}
        >
          {/* Left Column: Traffic Lights & Nav (Fixed Width) */}
          <div className="flex items-center gap-4 w-[100px] shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/20 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/20 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/20 shadow-sm"></div>
            </div>
            <div className="hidden md:flex items-center gap-3 text-gray-400 dark:text-gray-500 opacity-40 ml-1">
              <i className="fas fa-chevron-left text-[10px]"></i>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </div>
          </div>

          {/* Center Column: Address Bar (Flexible) */}
          <div className="flex-1 flex justify-center px-2 min-w-0">
             <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/10 w-full max-w-[320px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none backdrop-blur-md overflow-hidden">
               <div className="flex items-center gap-2 overflow-hidden min-w-0">
                 <i className="fas fa-lock text-[9px] text-gray-400 opacity-70 flex-shrink-0"></i>
                 <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-tight whitespace-nowrap select-none overflow-hidden">
                   {displayUrl}
                 </span>
               </div>
               <i className="fas fa-redo-alt text-[9px] text-gray-400 opacity-50 ml-2 flex-shrink-0"></i>
             </div>
          </div>

          {/* Right Column: Mirror Spacer (To keep center perfectly centered) */}
          <div className="w-[100px] shrink-0 flex justify-end">
             {/* Empty or can add Safari Share/Tabs icon for extra realism */}
             <div className="hidden md:flex items-center gap-3 text-gray-400 dark:text-gray-500 opacity-40 mr-1">
                <i className="fas fa-share text-[10px]"></i>
                <i className="fas fa-plus text-[10px]"></i>
             </div>
          </div>
        </div>

        {/* Content Area (Image) */}
        <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-black shrink-0 overflow-hidden border-b border-gray-100 dark:border-white/5 group-hover:shadow-inner">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-110"
          />
          
          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
             <span 
                className="px-6 py-2.5 rounded-full bg-white/10 text-white font-bold text-sm backdrop-blur-md border border-white/20 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500"
                style={{ transform: isHovered ? 'translateZ(50px)' : 'translateZ(0)' }}
             >
               View Details
             </span>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-6 flex flex-col flex-1 preserve-3d relative bg-white/50 dark:bg-[#161618]/50"
             style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{project.title}</h3>
            
            <div className="flex gap-2" style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)' }}>
               {project.codeUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(project.codeUrl, '_blank'); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-all hover:scale-110 hover:bg-white dark:hover:bg-white/20"
                    title="View Code"
                  >
                    <i className="fab fa-github text-sm"></i>
                  </button>
               )}
            </div>
          </div>
          
          <div className="mb-6 flex-1">
             <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium">
                {project.desc}
             </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
             {project.stack.split('•').slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/5">
                   {tech.trim()}
                </span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        
        // Combine static and fetched projects
        if (fetchedProjects.length > 0) {
          setProjects([...STATIC_PROJECTS, ...fetchedProjects]);
        }
      } catch (error) {
        console.error("Error fetching projects: ", error);
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

  const CaseCard = ({ title, text }: { title: string; text: string }) => (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-lg font-bold mb-3 text-blue-600 dark:text-blue-400">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
    </div>
  );

  return (
    <section id="work" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col items-center mb-20 text-center">
             <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">Selected Work</h2>
             <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"></div>
             <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl">
               A collection of projects crafted with precision, passion, and performance in mind.
             </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 150} className="h-full">
              <ProjectCard project={project} onClick={() => openModal(project)} />
            </Reveal>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div 
          className="fixed inset-0 z-[100] bg-[#fbfbfd] dark:bg-[#050505] overflow-y-auto animate-[fadeUp_0.3s_ease-out]"
        >
          <div className="container mx-auto px-6 py-10 max-w-6xl">
            <button 
              onClick={closeModal} 
              className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors group sticky top-4 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-md p-2 rounded-full w-fit"
            >
               <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                 <i className="fas fa-arrow-left text-xs"></i>
               </div>
               Back to Projects
            </button>
            
            <div className="w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 relative group bg-black">
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
               <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover opacity-90 scale-105" />
               
               <div className="absolute bottom-10 left-8 md:left-12 right-8 z-20 animate-[fadeUp_0.5s_ease-out_0.2s_both]">
                  <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 tracking-tighter">{selectedProject.title}</h1>
                  <div className="flex flex-wrap gap-2">
                     {selectedProject.stack.split('•').map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-semibold uppercase tracking-wide">
                            {tech.trim()}
                        </span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 animate-[fadeUp_0.5s_ease-out_0.3s_both]">
               <div className="lg:col-span-2">
                  <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">Project Overview</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                     {selectedProject.desc}
                  </p>
               </div>
               <div className="space-y-8">
                  <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-black/50">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Actions</h3>
                     <div className="flex flex-col gap-4">
                        {selectedProject.liveUrl && (
                           <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1">
                              View Live Project <i className="fas fa-external-link-alt text-xs"></i>
                           </a>
                        )}
                        {selectedProject.codeUrl && (
                           <a href={selectedProject.codeUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:-translate-y-1">
                              View Source Code <i className="fab fa-github"></i>
                           </a>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {selectedProject.highlights && (
               <div className="mb-20 animate-[fadeUp_0.5s_ease-out_0.5s_both]">
                  <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-[#1c1c1e] rounded-[2.5rem] p-8 md:p-12 border border-blue-100 dark:border-white/5">
                     <h3 className="text-3xl font-bold mb-10 text-center">Key Highlights</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedProject.highlights.map((highlight, idx) => (
                           <div key={idx} className="flex items-start gap-4 p-5 bg-white/80 dark:bg-black/20 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:scale-[1.02] transition-transform">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                 <i className="fas fa-check text-xs text-blue-600 dark:text-blue-400"></i>
                              </div>
                              <span className="text-gray-700 dark:text-gray-200 font-medium text-lg">{highlight}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {selectedProject.caseStudy && (
               <div className="mb-24 animate-[fadeUp_0.5s_ease-out_0.6s_both]">
                  <h3 className="text-3xl font-bold mb-10 text-center">Case Study</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <CaseCard title="The Challenge" text={selectedProject.caseStudy.challenge} />
                     <CaseCard title="The Solution" text={selectedProject.caseStudy.solution} />
                     <CaseCard title="The Results" text={selectedProject.caseStudy.results} />
                  </div>
               </div>
            )}

            <div className="text-center py-16 border-t border-gray-200 dark:border-white/10 animate-[fadeUp_0.5s_ease-out_0.7s_both]">
               <h3 className="text-3xl md:text-4xl font-bold mb-6">Interested in a Project Like This?</h3>
               <p className="text-gray-500 mb-10 max-w-xl mx-auto text-lg">Let's discuss how I can build an amazing digital solution for your business.</p>
               <a 
                 href="#contact" 
                 onClick={closeModal}
                 className="inline-flex items-center gap-3 px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl hover:shadow-xl"
               >
                 Start Your Project <i className="fas fa-arrow-right"></i>
               </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;