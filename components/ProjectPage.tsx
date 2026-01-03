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

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(data);
          document.title = `${data.title} — Portfolio`;
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    window.scrollTo(0, 0);
    
    return () => {
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
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Asset</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-9xl font-black mb-4 text-gray-200 dark:text-white/5">404</h1>
        <p className="text-gray-500 mb-8 font-medium">Project not found in repository.</p>
        <button onClick={handleBack} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">Return to Index</button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="bg-[#F2F2F7] dark:bg-[#050505] min-h-screen transition-colors duration-1000">
        
        {/* Minimalist Top Nav */}
        <div className="container mx-auto px-6 py-8">
          <button 
            onClick={handleBack}
            className="group flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <i className="fas fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
            Back to Projects
          </button>
        </div>

        {/* Hero Section: Split Layout */}
        <header className="container mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Device Mockup */}
            <Reveal variant="rotate-left" triggerOnMount>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative glass-strong rounded-[2.5rem] overflow-hidden border border-white/60 dark:border-white/10 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-[1.02]">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full aspect-[16/10] object-cover object-top" 
                  />
                  {/* Decorative Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </Reveal>

            {/* Right: Content */}
            <Reveal variant="skew-up" triggerOnMount delay={200}>
              <div className="space-y-8">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                  {project.category || 'Digital Solution'}
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-ultra leading-none">
                  {project.title}
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {project.desc}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 flex items-center gap-3">
                      <i className="fas fa-external-link-alt"></i> See Live Project
                    </a>
                  )}
                  <a href="#contact" className="px-8 py-4 rounded-2xl glass-strong border border-black/5 dark:border-white/10 text-gray-900 dark:text-white font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-white dark:hover:bg-white/5 flex items-center gap-3">
                    Get In Touch
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </header>

        {/* Technologies Section */}
        <section className="bg-white/50 dark:bg-white/5 py-24 border-y border-black/5 dark:border-white/5">
          <div className="container mx-auto px-6">
            <Reveal variant="slide">
              <div className="text-center mb-16">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">Technologies & Tools</h2>
                <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {project.stack.split(/[•,]/).map((tech, i) => (
                <Reveal key={i} delay={i * 100} variant="zoom-in">
                  <div className="glass-strong p-6 rounded-[2rem] border border-white/60 dark:border-white/10 flex flex-col items-center gap-4 text-center group hover:border-blue-500/30 transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <i className={`fas ${i % 2 === 0 ? 'fa-code' : 'fa-microchip'} text-lg`}></i>
                    </div>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">{tech.trim()}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Key Highlights */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <Reveal variant="slide">
              <div className="text-center mb-16">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">Key Highlights</h2>
                <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {(project.highlights || ['Cloud Integration', 'Mobile Optimized', 'SEO Performance', 'Secure Protocol']).map((h, i) => (
                <Reveal key={i} delay={i * 100} variant="fade">
                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-5 group hover:bg-white dark:hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <i className="fas fa-check text-[10px]"></i>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{h}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Case Study Grid */}
        <section className="bg-white/50 dark:bg-white/5 py-24">
          <div className="container mx-auto px-6">
            <Reveal variant="slide">
              <div className="text-center mb-16">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">Case Study</h2>
                <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Reveal variant="3d" delay={100}>
                <div className="h-full glass-strong p-10 rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl space-y-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">The Challenge</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Developing a resilient ecosystem that balances high-load technical requirements with an intuitive, user-centric interface tailored for global scalability.
                  </p>
                </div>
              </Reveal>
              <Reveal variant="3d" delay={200}>
                <div className="h-full glass-strong p-10 rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl space-y-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">The Solution</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Integrated a unified design system and modular microservices architecture, ensuring seamless cross-platform synchronization and elite performance benchmarks.
                  </p>
                </div>
              </Reveal>
              <Reveal variant="3d" delay={300}>
                <div className="h-full glass-strong p-10 rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl space-y-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">The Results</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Achieved a 40% increase in operational efficiency, validated by real-time analytics and positive user retention metrics across the production environment.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Dynamic CTA */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <Reveal variant="zoom-in">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Interested in a project like this?</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                  Let's discuss how I can build an amazing digital solution tailored for your unique business vision.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => window.location.hash = '#contact'}
                    className="px-12 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    Start Your Project
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </div>
    </Layout>
  );
};

export default ProjectPage;