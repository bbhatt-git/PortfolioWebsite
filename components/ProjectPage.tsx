import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import Layout from './Layout';
import Footer from './Footer';

const ProjectPage: React.FC<{ id: string }> = ({ id }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBack = () => {
    window.location.hash = '#work';
  };

  const handleContact = () => {
    window.location.href = '/#contact';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black mb-4">404</h1>
        <p className="text-gray-500 mb-8">Asset not found in repository.</p>
        <button onClick={handleBack} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold">Return Home</button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="bg-[#F2F2F7] dark:bg-[#050505] min-h-screen overflow-x-hidden">
        
        {/* Navigation Toolbar */}
        <div className="fixed top-0 left-0 right-0 z-[110] flex justify-between items-center px-6 py-4 md:px-12 md:py-6 pointer-events-none">
          <div className="pointer-events-auto">
            <button onClick={handleBack} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-black dark:text-white shadow-xl hover:scale-110 transition-transform">
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="w-full h-[45vh] md:h-[65vh] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F2F2F7] dark:to-[#050505] z-10"></div>
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover object-top transition-transform duration-[2s] ease-out-expo scale-105" 
          />
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 md:px-12 relative z-20 -mt-20 md:-mt-32 pb-32">
          <div className="max-w-4xl mx-auto">
            
            <div className="glass-strong rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12 animate-fade-up border border-white/40 dark:border-white/10 backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black dark:text-white mb-6 leading-tight relative z-10 tracking-tighter">{project.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                {project.stack.split(/[•,]/).map((tech, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                    {tech.trim()}
                  </span>
                ))}
              </div>
              
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium relative z-10 mb-10">
                {project.desc}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <i className="fas fa-check text-[10px]"></i>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-tight">{highlight}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-center text-sm shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group tracking-widest uppercase">
                    <i className="fas fa-external-link-alt group-hover:rotate-12 transition-transform"></i> Live Preview
                  </a>
                )}
                {project.codeUrl && (
                  <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-4 rounded-2xl bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 text-black dark:text-white font-black text-center text-sm hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group tracking-widest uppercase">
                    <i className="fas fa-code text-lg group-hover:scale-110 transition-transform"></i> View Code
                  </a>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-20 p-10 md:p-14 rounded-[2.5rem] bg-black text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-noise opacity-10"></div>
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
              
              <div className="relative z-10 text-center">
                <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Ready to build your vision?</h3>
                <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto font-medium leading-relaxed">
                  Let's transform your ideas into a high-performance digital reality.
                </p>
                <button 
                  onClick={handleContact}
                  className="px-10 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl flex items-center gap-3 mx-auto"
                >
                  Let's Talk <i className="fas fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </Layout>
  );
};

export default ProjectPage;