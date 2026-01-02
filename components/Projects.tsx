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
        <div className="fixed inset-0 z-[100] bg-[#fbfbfd] dark:bg-[#050505] overflow-y-auto animate-[fadeUp_0.3s_ease-out]">
          <div className="container mx-auto px-6 py-10 max-w-6xl">
            <button onClick={closeModal} className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors sticky top-4 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-md p-2 rounded-full">
               <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"><i className="fas fa-arrow-left text-xs"></i></div>
               Back to Projects
            </button>
            <div className="w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 relative group bg-black">
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
               <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover opacity-90 scale-105" />
               <div className="absolute bottom-10 left-8 md:left-12 right-8 z-20 animate-[fadeUp_0.5s_ease-out_0.2s_both]">
                  <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 tracking-tighter">{selectedProject.title}</h1>
                  <div className="flex flex-wrap gap-2">
                     {selectedProject.stack.split('•').map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-semibold uppercase tracking-wide">{tech.trim()}</span>
                     ))}
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
               <div className="lg:col-span-2">
                  <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">Project Overview</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">{selectedProject.desc}</p>
               </div>
               <div className="space-y-8">
                  <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Actions</h3>
                     <div className="flex flex-col gap-4">
                        {selectedProject.liveUrl && (
                           <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg">View Live Project <i className="fas fa-external-link-alt text-xs"></i></a>
                        )}
                        {selectedProject.codeUrl && (
                           <a href={selectedProject.codeUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all">View Source Code <i className="fab fa-github"></i></a>
                        )}
                     </div>
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