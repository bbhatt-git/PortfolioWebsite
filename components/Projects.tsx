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

  return (
    <div 
      ref={cardRef}
      className="group relative rounded-[2rem] transition-all duration-500 ease-out-expo transform-gpu preserve-3d h-full perspective-1000 cursor-pointer"
      style={{ transform: isTouch ? 'none' : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glare Effect */}
      <div 
        className="absolute inset-0 rounded-[2rem] z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, transparent 80%)`,
          opacity: glare.opacity * 0.6,
        }}
      ></div>

      {/* Main Card Container */}
      <div className="bg-white/60 dark:bg-[#161618]/80 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-white/20 dark:ring-white/5 relative z-10 flex flex-col h-full transition-transform duration-300 preserve-3d group-hover:shadow-2xl"
           style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)' }}>
        
        {/* Image Section with Overlay */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-black/20">
          <img 
             src={project.image} 
             alt={project.title} 
             className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-105" 
          />
          
          {/* Gradient Overlay at Bottom of Image for smooth transition */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/10 to-transparent dark:from-[#161618]/50"></div>

          {/* Glass Overlay on Image (visible on hover) - View Details */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center">
             <div className="px-6 py-3 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold text-sm transform scale-90 opacity-0 translate-y-4 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl flex items-center gap-2">
               <span>View Details</span> <i className="fas fa-arrow-right text-xs"></i>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 flex flex-col flex-1 relative">
           
           <div className="flex justify-between items-start mb-3 relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              
              {project.codeUrl && (
                  <button onClick={(e) => { e.stopPropagation(); window.open(project.codeUrl, '_blank'); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-gray-500 transition-all hover:scale-110 shadow-sm"
                    title="View Source Code"
                  >
                    <i className="fab fa-github text-lg"></i>
                  </button>
               )}
           </div>

           <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium mb-6 flex-1 relative z-10">
             {project.desc}
           </p>

           {/* Tech Stack - Modern Clean Pills */}
           <div className="flex flex-wrap gap-2 mt-auto relative z-10 border-t border-gray-100 dark:border-white/5 pt-4">
             {project.stack.split(/[•,]/).slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/5">
                   {tech.trim()}
                </span>
             ))}
             {project.stack.split(/[•,]/).length > 3 && (
                <span className="text-[10px] font-bold text-gray-400 px-2 py-1.5 flex items-center">+more</span>
             )}
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
        <Reveal variant="skew-up">
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
              <Reveal 
                key={project.id} 
                delay={index * 100} 
                variant={index % 2 === 0 ? "rotate-left" : "rotate-right"} 
                className="h-full"
              >
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

      {/* Full Page Project Detail Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] bg-[#F2F2F7] dark:bg-[#050505] overflow-y-auto animate-slide-up">
           
           {/* Sticky Header Actions */}
           <div className="fixed top-0 left-0 right-0 z-[110] flex justify-between items-center px-6 py-4 md:px-12 md:py-6 pointer-events-none">
              <div className="pointer-events-auto">
                 <button onClick={closeModal} className="w-12 h-12 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-black dark:text-white shadow-xl hover:scale-110 transition-transform">
                    <i className="fas fa-arrow-left"></i>
                 </button>
              </div>
              <div className="pointer-events-auto flex gap-3">
                 {selectedProject.liveUrl && (
                    <a href={selectedProject.liveUrl} target="_blank" className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors">
                       Visit Site
                    </a>
                 )}
              </div>
           </div>

           {/* Hero Image Section */}
           <div className="w-full h-[40vh] md:h-[65vh] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F2F2F7] dark:to-[#050505] z-10"></div>
               <img 
                 src={selectedProject.image} 
                 alt={selectedProject.title} 
                 className="w-full h-full object-cover object-top transition-transform duration-[2s] ease-out-expo scale-105" 
               />
           </div>

           {/* Content Container */}
           <div className="container mx-auto px-6 md:px-12 relative z-20 -mt-24 md:-mt-48 pb-32">
               <div className="max-w-4xl mx-auto">
                   
                   {/* Title Card */}
                   <div className="glass-strong rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12 animate-fade-up border border-white/20 dark:border-white/10 backdrop-blur-3xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                       
                       <h1 className="text-3xl md:text-6xl font-bold text-black dark:text-white mb-6 leading-tight relative z-10">{selectedProject.title}</h1>
                       <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                          {selectedProject.stack.split(/[•,]/).map((tech, i) => (
                             <span key={i} className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/10 border border-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                {tech.trim()}
                             </span>
                          ))}
                       </div>
                       <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light relative z-10">
                          {selectedProject.desc}
                       </p>
                   </div>

                   {/* Grid Layout for Details */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                       <div className="glass rounded-[2rem] p-8 md:p-10 border-t-4 border-t-blue-500 hover:-translate-y-1 transition-transform duration-300">
                           <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                              <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg"><i className="fas fa-mountain"></i></span>
                              The Challenge
                           </h3>
                           <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {selectedProject.caseStudy?.challenge || "Navigating complex user requirements while maintaining a clean, intuitive interface was the primary hurdle. Performance optimization on low-end devices was also critical."}
                           </p>
                       </div>

                       <div className="glass rounded-[2rem] p-8 md:p-10 border-t-4 border-t-green-500 hover:-translate-y-1 transition-transform duration-300">
                           <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                              <span className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-lg"><i className="fas fa-lightbulb"></i></span>
                              The Solution
                           </h3>
                           <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {selectedProject.caseStudy?.solution || "We implemented a modular architecture using modern frameworks. Advanced caching strategies and server-side rendering were utilized to ensure lightning-fast load times."}
                           </p>
                       </div>
                   </div>

                   {/* Links Section */}
                   <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                       {selectedProject.liveUrl && (
                          <a href={selectedProject.liveUrl} target="_blank" className="flex-1 py-4 md:py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center text-lg shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                             <i className="fas fa-external-link-alt"></i> Live Preview
                          </a>
                       )}
                       {selectedProject.codeUrl && (
                          <a href={selectedProject.codeUrl} target="_blank" className="flex-1 py-4 md:py-5 rounded-2xl bg-white dark:bg-white/10 text-black dark:text-white border border-gray-200 dark:border-white/10 font-bold text-center text-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                             <i className="fab fa-github"></i> View Code
                          </a>
                       )}
                   </div>

                   {/* New CTA Section */}
                   <div className="mt-24 p-8 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-purple-600 text-center text-white relative overflow-hidden shadow-2xl hover:scale-[1.01] transition-transform duration-500">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-20"></div>
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Want to start a project like this?</h3>
                            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                                Let's collaborate and bring your unique vision to life with pixel-perfect design and robust code.
                            </p>
                            <button 
                                onClick={() => {
                                    closeModal();
                                    setTimeout(() => {
                                      const contactSection = document.getElementById('contact');
                                      if (contactSection) {
                                          contactSection.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }, 100);
                                }}
                                className="px-10 py-4 rounded-2xl bg-white text-blue-600 font-bold text-lg hover:scale-105 transition-transform shadow-xl hover:shadow-white/20 flex items-center gap-3 mx-auto"
                            >
                                Let's Talk <i className="fas fa-arrow-right"></i>
                            </button>
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