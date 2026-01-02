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
    const x = (e.clientX - left - width / 2) / 40; 
    const y = (e.clientY - top - height / 2) / 40; 
    
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

  return (
    <div 
      ref={cardRef}
      className="group relative rounded-[20px] transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] transform-gpu preserve-3d h-full perspective-2000 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 cursor-pointer"
      style={{
        transform: isTouch ? 'none' : `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Subtle Glare */}
      <div 
        className="absolute inset-0 rounded-[20px] z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `linear-gradient(125deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%)`,
          opacity: glare.opacity * 0.5,
        }}
      ></div>

      {/* Main Card Container */}
      <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-2xl rounded-[20px] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] relative z-10 flex flex-col h-full transition-all duration-500 preserve-3d"
           style={{ transform: isHovered ? 'translateZ(10px)' : 'translateZ(0)' }}
      >
        {/* macOS Title Bar */}
        <div className="h-[38px] bg-[#f3f3f3] dark:bg-[#2c2c2e] border-b border-[#e5e5e5] dark:border-black flex items-center px-4 gap-4 shrink-0 preserve-3d relative"
             style={{ transform: isHovered ? 'translateZ(5px)' : 'translateZ(0)' }}
        >
          <div className="flex gap-[8px]">
            <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm"></div>
            <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
            <div className="w-[11px] h-[11px] rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
          </div>
          
          <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
             <div className="flex items-center gap-1.5 opacity-60">
               <i className="fas fa-lock text-[8px] text-gray-500"></i>
               <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 tracking-wide">{project.title}</span>
             </div>
          </div>
        </div>

        {/* Content Area (Image Only, No Iframe) */}
        <div className="relative w-full aspect-[16/10] bg-white dark:bg-black shrink-0 overflow-hidden border-b border-[#f0f0f0] dark:border-[#333] group">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <span className="px-5 py-2 rounded-full bg-white/90 text-black font-semibold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
               View Details
             </span>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-5 bg-[#fff] dark:bg-[#1c1c1e] flex flex-col flex-1 preserve-3d relative z-20"
             style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.title}</h3>
            
            <div className="flex gap-2">
               {project.codeUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(project.codeUrl, '_blank'); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <i className="fab fa-github text-xs"></i>
                  </button>
               )}
            </div>
          </div>
          
          <div className="mb-4 flex-1">
             <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                {project.desc}
             </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto">
             {project.stack.split('•').slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2c2c2e] px-2 py-1 rounded-md border border-gray-200 dark:border-white/5">
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
    <section id="work" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col items-center mb-16 text-center">
             <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Selected Work</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-lg">
               A collection of projects crafted with precision.
             </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 100} className="h-full">
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
            
            <div className="w-full aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl mb-12 relative group bg-black">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
               <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover opacity-90" />
               
               <div className="absolute bottom-8 left-6 md:left-12 right-6 z-20 animate-[fadeUp_0.5s_ease-out_0.2s_both]">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">{selectedProject.title}</h1>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 animate-[fadeUp_0.5s_ease-out_0.3s_both]">
               <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Project Overview</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                     {selectedProject.desc}
                  </p>
               </div>
               <div className="space-y-8">
                  <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
                     <div className="flex flex-col gap-3">
                        {selectedProject.liveUrl && (
                           <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30">
                              View Live Project <i className="fas fa-external-link-alt text-xs"></i>
                           </a>
                        )}
                        {selectedProject.codeUrl && (
                           <a href={selectedProject.codeUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                              View Source Code <i className="fab fa-github"></i>
                           </a>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            <div className="mb-20 animate-[fadeUp_0.5s_ease-out_0.4s_both]">
               <h3 className="text-2xl font-bold mb-8 text-center">Technologies & Tools</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedProject.stack.split('•').map((tech, idx) => (
                     <div key={idx} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 text-lg">
                           <i className="fas fa-code"></i>
                        </div>
                        <span className="text-sm font-medium text-center">{tech.trim()}</span>
                     </div>
                  ))}
               </div>
            </div>

            {selectedProject.highlights && (
               <div className="mb-20 animate-[fadeUp_0.5s_ease-out_0.5s_both]">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] p-8 md:p-12 border border-blue-100 dark:border-blue-500/10">
                     <h3 className="text-2xl font-bold mb-10 text-center">Key Highlights</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedProject.highlights.map((highlight, idx) => (
                           <div key={idx} className="flex items-start gap-4 p-4 bg-white/60 dark:bg-[#1c1c1e]/60 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                 <i className="fas fa-check text-[10px] text-blue-600 dark:text-blue-400"></i>
                              </div>
                              <span className="text-gray-700 dark:text-gray-200 font-medium">{highlight}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {selectedProject.caseStudy && (
               <div className="mb-24 animate-[fadeUp_0.5s_ease-out_0.6s_both]">
                  <h3 className="text-2xl font-bold mb-10 text-center">Case Study</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <CaseCard title="The Challenge" text={selectedProject.caseStudy.challenge} />
                     <CaseCard title="The Solution" text={selectedProject.caseStudy.solution} />
                     <CaseCard title="The Results" text={selectedProject.caseStudy.results} />
                  </div>
               </div>
            )}

            <div className="text-center py-12 border-t border-gray-200 dark:border-white/10 animate-[fadeUp_0.5s_ease-out_0.7s_both]">
               <h3 className="text-3xl font-bold mb-4">Interested in a Project Like This?</h3>
               <p className="text-gray-500 mb-8 max-w-xl mx-auto">Let's discuss how I can build an amazing digital solution for your business.</p>
               <a 
                 href="#contact" 
                 onClick={closeModal}
                 className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform shadow-xl"
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