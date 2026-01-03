import React, { useState, useRef, useEffect } from 'react';
import Reveal from './Reveal';
import { Project } from '../types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// 3D Tilt Card Component
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable complex tilt on touch devices for performance
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Calculate rotation (max 10deg)
    const x = (e.clientX - left - width / 2) / 20; 
    const y = (e.clientY - top - height / 2) / 20; 
    
    // Calculate glare position (%)
    const glareX = ((e.clientX - left) / width) * 100;
    const glareY = ((e.clientY - top) / height) * 100;

    setRotate({ x: -y, y: x }); // Invert Y for correct tilt axis
    setGlare({ x: glareX, y: glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleMouseEnter = () => setIsHovered(true);

  // Formatting URL for display
  const displayUrl = project.liveUrl ? project.liveUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : 'project.local';

  return (
    <div 
      ref={cardRef}
      className="group relative rounded-[2rem] transition-all duration-300 ease-out-expo transform-gpu preserve-3d h-full perspective-1000 cursor-pointer"
      style={{ 
        transform: isTouch ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glare Effect */}
      <div 
        className="absolute inset-0 rounded-[2rem] z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, transparent 80%)`,
          opacity: glare.opacity * 0.7,
        }}
      ></div>

      <div className="bg-white/60 dark:bg-[#161618]/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-xl dark:shadow-black/50 border border-white/40 dark:border-white/5 relative z-10 flex flex-col h-full transition-transform duration-300 preserve-3d"
           style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0)' }}>
        
        {/* Browser Mockup Header */}
        <div className="h-10 bg-gray-100/50 dark:bg-[#1E1E20]/50 border-b border-gray-200 dark:border-white/5 flex items-center px-4 gap-2 shrink-0 preserve-3d">
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
           </div>
           <div className="flex-1 text-center">
              <div className="inline-block px-3 py-0.5 rounded-md bg-white/40 dark:bg-black/20 text-[10px] text-gray-500 font-medium">
                {displayUrl}
              </div>
           </div>
           <div className="w-10"></div>
        </div>

        {/* Image Container with Parallax Zoom */}
        <div className="relative w-full aspect-video bg-gray-100 dark:bg-black shrink-0 overflow-hidden border-b border-gray-100 dark:border-white/5">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-110" 
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
             <span className="px-5 py-2 rounded-full bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">View Details</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 bg-white/30 dark:bg-[#161618]/30">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h3>
            <div className="flex gap-2" style={{ transform: 'translateZ(20px)' }}>
               {project.codeUrl && (
                  <button onClick={(e) => { e.stopPropagation(); window.open(project.codeUrl, '_blank'); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-colors hover:scale-110">
                    <i className="fab fa-github"></i>
                  </button>
               )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium mb-6 flex-1">{project.desc}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
             {project.stack.split('•').slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-1 rounded border border-black/5 dark:border-white/5">{tech.trim()}</span>
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
    <section id="work" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col items-center mb-16 text-center">
             <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Selected Work.</h2>
             <div className="h-1 w-20 bg-blue-600 rounded-full mb-4"></div>
             <p className="text-gray-500 dark:text-gray-400 max-w-xl">
               A collection of projects crafted with precision and passion.
             </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 100} className="h-full">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-scale-in">
          {/* Backdrop */}
          <div 
             className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl transition-opacity"
             onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 dark:border-white/10 glass-strong">
             
             {/* Close Button Mobile */}
             <button 
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-black dark:text-white md:hidden"
             >
                <i className="fas fa-times"></i>
             </button>

             {/* Image Section */}
             <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-black overflow-hidden group">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
                
                {/* Floating Tags */}
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                   {selectedProject.stack.split('•').map((tech, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                         {tech.trim()}
                      </span>
                   ))}
                </div>
             </div>
             
             {/* Details Section */}
             <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <div>
                       <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{selectedProject.title}</h2>
                       <p className="text-blue-600 dark:text-blue-400 font-medium">Full Stack Development</p>
                   </div>
                   <button 
                      onClick={closeModal}
                      className="hidden md:flex w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 items-center justify-center transition-colors"
                   >
                      <i className="fas fa-times text-lg"></i>
                   </button>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                      {selectedProject.desc}
                   </p>
                </div>
                
                <div className="mt-auto space-y-4">
                   <div className="flex flex-col sm:flex-row gap-4">
                      {selectedProject.liveUrl && (
                        <a href={selectedProject.liveUrl} target="_blank" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-center shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                           <i className="fas fa-external-link-alt"></i> Live Demo
                        </a>
                      )}
                      {selectedProject.codeUrl && (
                        <a href={selectedProject.codeUrl} target="_blank" className="flex-1 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-center border border-gray-200 dark:border-white/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                           <i className="fab fa-github"></i> Source Code
                        </a>
                      )}
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