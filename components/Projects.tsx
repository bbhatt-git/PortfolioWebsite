import React, { useState, useRef, useEffect } from 'react';
import Reveal from './Reveal';
import { Project } from '../types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      ref={cardRef}
      className="group relative rounded-[2rem] transition-all duration-500 cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="bg-white/40 dark:bg-[#161618]/60 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-xl border border-white/40 dark:border-white/5 relative z-10 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-black/20">
          <img 
             src={project.image} 
             alt={project.title} 
             className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center">
             <div className="px-6 py-2.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white font-bold text-xs shadow-xl flex items-center gap-2">
               View Details <i className="fas fa-arrow-right text-[10px]"></i>
             </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col flex-1">
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
           </h3>
           <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-6 flex-1">
             {project.desc}
           </p>
           <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-black/5 dark:border-white/5">
             {project.stack.split(/[•,]/).slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">
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

  const navigateToProject = (project: Project) => {
    const slug = project.title.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    window.history.pushState({}, '', `/project/${slug}`);
    window.dispatchEvent(new Event('pushstate'));
  };

  return (
    <section id="work" className="py-24 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="fade">
          <div className="flex flex-col items-center mb-16 text-center">
             <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Selected Work.</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-xl">
               A collection of projects crafted with precision and passion.
             </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {projects.map((project, index) => (
              <Reveal 
                key={project.id} 
                delay={index * 100} 
                variant="fade"
                className="h-full"
              >
                <ProjectCard project={project} onClick={() => navigateToProject(project)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-medium">No projects found in the repository.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;