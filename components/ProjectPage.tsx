import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import Layout from './Layout';
import Footer from './Footer';
import Reveal from './Reveal';
import Toast from './Toast';
import Contact from './Contact';

/**
 * Enhanced mapping logic to assign professional brand icons and colors.
 */
const getTechIcon = (tech: string) => {
  const t = tech.toLowerCase().trim();

  if (t.includes('vite')) return { icon: 'fas fa-bolt', color: 'text-[#646CFF]' };
  if (t.includes('tailwind')) return { icon: 'fas fa-wind', color: 'text-[#06B6D4]' };
  if (t.includes('next')) return { icon: 'fas fa-layer-group', color: 'text-gray-900 dark:text-white' };
  if (t.includes('react')) return { icon: 'fab fa-react', color: 'text-[#61DAFB]' };
  if (t.includes('flutter')) return { icon: 'fas fa-mobile-screen', color: 'text-[#02569B]' };
  if (t.includes('pwa') || t.includes('manifest')) return { icon: 'fas fa-mobile-screen-button', color: 'text-[#5A0FC8]' };
  if (t.includes('leaflet')) return { icon: 'fas fa-map-location-dot', color: 'text-[#199900]' };
  if (t.includes('openstreetmap') || t.includes('osm')) return { icon: 'fas fa-map', color: 'text-[#7EBC6F]' };
  if (t.includes('wordpress')) return { icon: 'fab fa-wordpress', color: 'text-[#21759B]' };

  if (t.includes('typescript') || t === 'ts') return { icon: 'fas fa-code', color: 'text-[#3178C6]' };
  if (t.includes('javascript') || t === 'js') return { icon: 'fab fa-js', color: 'text-[#F7DF1E]' };
  if (t.includes('html')) return { icon: 'fab fa-html5', color: 'text-[#E34F26]' };
  if (t.includes('css')) return { icon: 'fab fa-css3-alt', color: 'text-[#1572B6]' };
  if (t.includes('python')) return { icon: 'fab fa-python', color: 'text-[#3776AB]' };
  if (t.includes('php')) return { icon: 'fab fa-php', color: 'text-[#777BB4]' };
  if (t.includes('node')) return { icon: 'fab fa-node-js', color: 'text-[#339933]' };
  if (t === 'c' || t === 'cpp' || t.includes('c++')) return { icon: 'fas fa-microchip', color: 'text-[#A8B9CC]' };

  if (t.includes('firebase')) return { icon: 'fas fa-fire', color: 'text-[#FFCA28]' };
  if (t.includes('mongo')) return { icon: 'fas fa-leaf', color: 'text-[#47A248]' };
  if (t.includes('mysql') || t.includes('sql') || t.includes('postgres')) return { icon: 'fas fa-database', color: 'text-[#4479A1]' };

  if (t.includes('figma')) return { icon: 'fab fa-figma', color: 'text-[#F24E1E]' };
  if (t.includes('canva')) return { icon: 'fas fa-palette', color: 'text-[#00C4CC]' };
  if (t.includes('photoshop') || t.includes('adobe')) return { icon: 'fas fa-image', color: 'text-[#31A8FF]' };
  if (t.includes('github') || t.includes('git')) return { icon: 'fab fa-github', color: 'text-gray-900 dark:text-white' };
  if (t.includes('api')) return { icon: 'fas fa-gears', color: 'text-gray-500' };

  if (t.includes('ai') || t.includes('ml') || t.includes('intelligence') || t.includes('gemini') || t.includes('gpt')) return { icon: 'fas fa-brain', color: 'text-[#8B5CF6]' };
  if (t.includes('bot') || t.includes('chat')) return { icon: 'fas fa-robot', color: 'text-[#3B82F6]' };

  return { icon: 'fas fa-cube', color: 'text-blue-500' };
};

// Utility to create slug from title
const createSlug = (title: string) => title.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

// Component now accepts slug instead of ID
const ProjectPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Since we are using slugs based on titles and don't have a 'slug' field in DB,
        // we fetch projects and filter. For a portfolio with < 100 items, this is fine.
        // Ideally, add a 'slug' field to Firestore documents for direct querying.
        const q = query(collection(db, "projects"));
        const querySnapshot = await getDocs(q);
        
        let foundProject: Project | null = null;
        
        querySnapshot.forEach((doc) => {
           const data = doc.data() as Project;
           if (createSlug(data.title) === slug) {
             foundProject = { id: doc.id, ...data };
           }
        });

        if (foundProject) {
          setProject(foundProject);
          document.title = `${foundProject.title} — Portfolio`;
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
  }, [slug]);

  useEffect(() => {
    if (isContactModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isContactModalOpen]);

  const handleBack = () => {
    window.location.hash = '#work';
  };

  const handleShare = async () => {
    if (!project) return;
    const shareData = {
      title: project.title,
      text: project.desc,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setToast({ show: true, message: 'Link copied to clipboard!', type: 'success' });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  // Helper to extract domain from URL for the browser bar
  const getDomain = (url?: string) => {
      if (!url) return 'localhost:3000';
      try {
          return new URL(url).hostname;
      } catch {
          return 'project-preview.com';
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Module...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-8xl font-black mb-4 text-gray-200 dark:text-white/5">ERR_404</h1>
        <p className="text-gray-500 mb-8 font-medium">Asset not found in secure repository.</p>
        <button onClick={handleBack} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">Return to Index</button>
      </div>
    );
  }

  const techItems = project.stack ? project.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean) : [];

  return (
    <Layout>
      <div className="bg-[#F2F2F7] dark:bg-[#050505] min-h-screen transition-colors duration-1000">
        
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ ...toast, show: false })} 
          />
        )}

        {/* Top Header Navigation */}
        <div className="container mx-auto px-6 pt-12 md:pt-16">
          <button 
            onClick={handleBack}
            className="group flex items-center gap-4 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-all uppercase tracking-[0.4em]"
          >
            <i className="fas fa-long-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
            Back to Archive
          </button>
        </div>

        {/* Hero Section */}
        <header className="container mx-auto px-6 pt-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Left View - REDESIGNED: Sleek Browser Window Aesthetic */}
            <Reveal variant="rotate-left" triggerOnMount>
              <div className="relative group perspective-1000">
                {/* Ambient Glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur-3xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Browser Frame */}
                <div className="relative rounded-xl bg-[#F0F0F3] dark:bg-[#121212] overflow-hidden shadow-2xl border border-white/40 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 transform transition-transform duration-700 group-hover:rotate-x-2 group-hover:scale-[1.01]">
                   
                   {/* Browser Toolbar */}
                   <div className="bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-black/5 dark:border-white/5 z-20 relative">
                       {/* Traffic Lights */}
                       <div className="flex gap-2 shrink-0">
                         <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-[#E0443E]/50"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-[#1AAB29]/50"></div>
                       </div>
                       
                       {/* URL Bar Simulation */}
                       <div className="flex-1 bg-gray-100 dark:bg-[#2C2C2E] rounded-md h-7 flex items-center justify-center overflow-hidden relative shadow-inner">
                          <div className="flex items-center gap-2 opacity-60">
                             <i className="fas fa-lock text-[8px] text-gray-500"></i>
                             <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-tight select-none">
                                {getDomain(project.liveUrl)}
                             </span>
                          </div>
                          {/* Progress bar hint */}
                          <div className="absolute bottom-0 left-0 h-[1px] bg-blue-500 w-full opacity-0 group-hover:opacity-50 transition-opacity duration-1000"></div>
                       </div>

                       <div className="w-8 shrink-0 flex justify-end opacity-30">
                          <i className="fas fa-rotate-right text-xs"></i>
                       </div>
                   </div>

                   {/* Viewport/Image */}
                   <div className="aspect-[16/10] overflow-hidden relative bg-gray-100 dark:bg-black/40 group-hover:cursor-n-resize">
                      <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover object-top transition-transform duration-[1.5s] ease-in-out group-hover:translate-y-[-10%]" 
                      />
                      {/* Screen Gloss/Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10"></div>
                   </div>
                </div>
              </div>
            </Reveal>

            {/* Right Metadata */}
            <Reveal variant="skew-up" triggerOnMount delay={200}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">
                    {project.category || 'System Architecture'}
                  </span>
                  <div className="flex justify-between items-start">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-ultra leading-[0.9]">
                      {project.title}
                    </h1>
                    <button 
                      onClick={handleShare}
                      className="w-12 h-12 rounded-2xl glass-strong border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all shadow-sm"
                      title="Share Project"
                    >
                      <i className="fas fa-share-nodes"></i>
                    </button>
                  </div>
                </div>
                
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-xl">
                  {project.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                      <i className="fas fa-external-link-alt"></i> See Live Project
                    </a>
                  )}
                  <button onClick={openContactModal} className="px-10 py-5 rounded-2xl glass-strong border border-black/5 dark:border-white/10 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-white dark:hover:bg-white/5 flex items-center justify-center gap-3">
                    Inquire Similar
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </header>

        {/* Technologies Section */}
        <section className="bg-white/40 dark:bg-white/5 py-24 md:py-32 border-y border-black/5 dark:border-white/5">
          <div className="container mx-auto px-6">
            <Reveal variant="slide">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.5em] mb-4">Core Infrastructure</h2>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Technologies & Tools</h3>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {techItems.map((tech, i) => {
                const { icon, color } = getTechIcon(tech);
                return (
                  <Reveal key={i} delay={i * 100} variant="zoom-in">
                    <div className="glass-strong p-8 rounded-[2.5rem] border border-white/80 dark:border-white/10 flex flex-col items-center justify-center gap-5 text-center transition-all hover:-translate-y-2 hover:bg-white dark:hover:bg-white/5 group h-full">
                      <div className={`w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/5 flex items-center justify-center ${color} text-2xl shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform`}>
                        <i className={icon}></i>
                      </div>
                      <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-[0.1em]">{tech}</span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Key Highlights */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <Reveal variant="slide">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.5em] mb-4">Project Metrics</h2>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Key Highlights</h3>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
              {(project.highlights || ['Cloud Integration', 'Mobile Optimized', 'SEO Performance', 'Secure Protocol', 'AI-Powered Search']).map((h, i) => (
                <Reveal key={i} delay={i * 80} variant="fade">
                  <div className="p-6 md:p-8 rounded-[1.8rem] bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-6 group hover:bg-white dark:hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                      <i className="fas fa-check text-xs"></i>
                    </div>
                    <span className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-300 tracking-tight">{h}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Case Study Grid */}
        <section className="bg-white/40 dark:bg-white/5 py-24 md:py-32">
          <div className="container mx-auto px-6">
            <Reveal variant="slide">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.5em] mb-4">The Narrative</h2>
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Case Study</h3>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { title: 'The Challenge', desc: 'Implementing a scalable architecture that handles high-concurrent traffic while maintaining an ultra-low latency user interface and consistent design language.', icon: 'fa-triangle-exclamation', glow: 'bg-orange-500/10' },
                { title: 'The Solution', desc: 'Integrated a modern tech stack centered on React and Node.js with distributed database systems and real-time synchronization hooks for maximum responsiveness.', icon: 'fa-lightbulb', glow: 'bg-blue-600/10' },
                { title: 'The Results', desc: 'Successfully deployed a production-ready environment achieving 99.9% uptime and a significant reduction in system overhead compared to legacy frameworks.', icon: 'fa-chart-line', glow: 'bg-green-500/10' }
              ].map((item, i) => (
                <Reveal key={i} delay={i * 200} variant="3d">
                  <div className="h-full glass-strong p-10 md:p-12 rounded-[3rem] border border-white/80 dark:border-white/10 shadow-xl relative overflow-hidden group hover:bg-white dark:hover:bg-white/5 transition-all">
                    <div className={`absolute -top-10 -right-10 w-32 h-32 ${item.glow} rounded-full blur-[60px]`}></div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xl text-gray-800 dark:text-white mb-8 border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                       <i className={`fas ${item.icon}`}></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">{item.title}</h3>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Project CTA */}
        <section className="py-32 md:py-48 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] animate-liquid pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10">
            <Reveal variant="zoom-in">
              <div className="max-w-4xl mx-auto space-y-10">
                <h2 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                   Interested in a <br/> Project Like This?
                </h2>
                <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                  Let's discuss how I can build an amazing digital solution tailored for your business vision.
                </p>
                <div className="pt-8">
                  <button 
                    onClick={openContactModal}
                    className="px-14 py-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_24px_48px_-12px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
                  >
                    Initiate Contact
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />

        {/* Full Page Contact Modal */}
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="fixed top-6 right-6 z-[110] w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-800 dark:text-white hover:rotate-90 transition-all duration-300 shadow-lg hover:shadow-2xl"
              title="Close Modal"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            
            <div className="min-h-screen flex items-center justify-center p-4">
              <Contact onSuccess={() => setIsContactModalOpen(false)} isModal={true} />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ProjectPage;