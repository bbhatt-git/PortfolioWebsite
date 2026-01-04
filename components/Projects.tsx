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

  const handleMouseEnter = () => {
    setIsHovered(true);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-bot-msg={`${project.title} - excellent choice!|I helped build ${project.title}.|Want to see how ${project.title} works?|${project.title} is one of my favorites.`}
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
           style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0)' }}>
        
        {/* Image Section with Overlay */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-black/20 transform-style-3d">
          <img 
             src={project.image} 
             alt={project.title} 
             className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-105" 
          />
          
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/10 to-transparent dark:from-[#161618]/50"></div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center">
             <div className="px-6 py-3 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold text-sm transform scale-90 opacity-0 translate-y-4 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl flex items-center gap-2">
               <span>View Details</span> <i className="fas fa-arrow-right text-xs"></i>
             </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col flex-1 relative transform-style-3d">
           
           <div className="flex justify-between items-start mb-3 relative z-10 transform translate-z-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              
              {project.codeUrl && (
                  <button onClick={(e) => { e.stopPropagation(); window.open(project.codeUrl, '_blank'); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-gray-500 transition-all hover:scale-110 shadow-sm"
                    title="View Source Code"
                    data-bot-msg="Checking the source code?|Peeking under the hood.|It's clean code, I promise."
                  >
                    <i className="fab fa-github text-lg"></i>
                  </button>
               )}
           </div>

           <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium mb-6 flex-1 relative z-10">
             {project.desc}
           </p>

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

  // Use history API for navigation
  const navigateToProject = (project: Project) => {
    const slug = project.title.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    window.history.pushState({}, '', `/project/${slug}`);
    window.dispatchEvent(new Event('pushstate'));
  };

  return (
    <section id="work" className="py-24 relative overflow-hidden preserve-3d">
      <div className="container mx-auto px-6 relative z-10 preserve-3d">
        <Reveal variant="slit-scan">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 perspective-2000">
            {projects.map((project, index) => (
              <Reveal 
                key={project.id} 
                delay={index * 150} 
                variant="deck-shuffle" // NEW: Cinematic deck deal animation
                className="h-full preserve-3d"
              >
                <ProjectCard project={project} onClick={() => navigateToProject(project)} />
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
    </section>
  );
};

export default Projects;