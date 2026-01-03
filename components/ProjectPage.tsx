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
 * Mapping logic to assign professional brand icons and colors for tech stack.
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

const ProjectPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
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
          document.title = `${foundProject.title} — Bhupesh Bhatt`;
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

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('pushstate'));
  };

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ show: true, message: 'Link copied to clipboard!', type: 'success' });
      setIsShareOpen(false);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Assets...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-8xl font-black mb-4 text-gray-200 dark:text-white/5">404</h1>
        <p className="text-gray-500 mb-8 font-medium">Asset not found in secure repository.</p>
        <button onClick={handleBack} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">Return to Index</button>
      </div>
    );
  }

  const techItems = project.stack ? project.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean) : [];
  const currentUrl = window.location.href;
  const shareText = `Check out this project: ${project.title} by Bhupesh Bhatt`;

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

        {/* TOP STICKY NAVIGATION */}
        <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 py-3 shadow-md' : 'py-8'}`}>
          <div className="container mx-auto px-6 flex items-center justify-between">
            <button 
              onClick={handleBack}
              className={`group flex items-center gap-4 text-[10px] font-black transition-all uppercase tracking-[0.4em] ${isScrolled ? 'text-gray-500 hover:text-blue-600' : 'text-white/70 hover:text-white'}`}
            >
              <i className="fas fa-long-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
              <span>Back to Archive</span>
            </button>
            
            <div className={`transition-all duration-500 absolute left-1/2 -translate-x-1/2 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
               <h1 className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px] text-center">{project.title}</h1>
            </div>

            <div className="flex items-center gap-4">
               {project.liveUrl && (
                 <a href={project.liveUrl} target="_blank" className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] hover:scale-110 transition-transform">
                   <i className="fas fa-external-link-alt"></i>
                 </a>
               )}
               <button onClick={() => setIsShareOpen(true)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] hover:scale-110 transition-transform ${isScrolled ? 'bg-gray-100 dark:bg-white/10 text-gray-500' : 'bg-white/10 text-white/70'}`}>
                  <i className="fas fa-share-nodes"></i>
               </button>
            </div>
          </div>
        </div>

        {/* IMMERSIVE BACKGROUND HERO */}
        <header className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden flex items-end">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover object-top scale-105"
                />
                
                {/* DARK OVERLAY FOR TEXT READABILITY */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* DYNAMIC MORPHING GRADIENT BLEND */}
                {/* This div blends the bottom of the image into the page background based on theme */}
                <div className="absolute inset-x-0 bottom-0 h-[60%] z-20 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7]/40 to-transparent dark:from-[#050505] dark:via-[#050505]/40 transition-colors duration-1000"></div>
            </div>

            {/* HERO CONTENT OVER IMAGE */}
            <div className="container mx-auto px-6 relative z-30 pb-16 md:pb-24">
                <div className="max-w-4xl">
                    <Reveal variant="skew-up" triggerOnMount>
                        <div className="space-y-4 md:space-y-6">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20">
                                {project.category || 'System Architecture'}
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-gray-900 dark:text-white tracking-ultra leading-[0.85]">
                                {project.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-semibold max-w-2xl">
                                {project.desc}
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </header>

        {/* PAGE CONTENT STARTS HERE (BLENDED) */}
        <div className="relative z-40">
            
            {/* QUICK ACTIONS BUTTONS */}
            <div className="container mx-auto px-6 -mt-8 md:-mt-12 mb-24 md:mb-32">
                <Reveal variant="zoom-in" triggerOnMount delay={300}>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/40 transition-all hover:-translate-y-1 flex items-center gap-3">
                                <i className="fas fa-external-link-alt text-xs"></i> Open Deployment
                            </a>
                        )}
                        {project.codeUrl && (
                            <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-white dark:hover:bg-white/5 hover:-translate-y-1">
                                <i className="fab fa-github text-sm"></i> Source Repository
                            </a>
                        )}
                        <button onClick={openContactModal} className="px-10 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:opacity-80 hover:-translate-y-1">
                            Project Inquiry
                        </button>
                    </div>
                </Reveal>
            </div>

            {/* TECHNOLOGIES SECTION */}
            <section className="py-24 md:py-32 border-t border-black/5 dark:border-white/5 bg-white/20 dark:bg-white/5">
              <div className="container mx-auto px-6">
                <Reveal variant="slide">
                  <div className="flex flex-col items-center mb-16 text-center">
                    <h2 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.5em] mb-4">The Stack</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Core Technologies</h3>
                  </div>
                </Reveal>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                  {techItems.map((tech, i) => {
                    const { icon, color } = getTechIcon(tech);
                    return (
                      <Reveal key={i} delay={i * 100} variant="zoom-in">
                        <div className="glass-strong p-8 rounded-[2rem] border border-white/80 dark:border-white/10 flex flex-col items-center justify-center gap-5 text-center transition-all hover:-translate-y-2 hover:bg-white dark:hover:bg-white/5 group h-full shadow-sm hover:shadow-xl">
                          <div className={`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center ${color} text-2xl shadow-inner border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform`}>
                            <i className={icon}></i>
                          </div>
                          <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">{tech}</span>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* KEY HIGHLIGHTS */}
            <section className="py-24 md:py-32">
              <div className="container mx-auto px-6">
                <Reveal variant="slide">
                  <div className="flex flex-col items-center mb-16 text-center">
                    <h2 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.5em] mb-4">Project Metrics</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Performance Highlights</h3>
                  </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
                  {(project.highlights || ['Cloud Integration', 'Mobile Optimized', 'SEO Performance', 'Secure Protocol', 'AI-Powered Search']).map((h, i) => (
                    <Reveal key={i} delay={i * 80} variant="fade">
                      <div className="p-8 rounded-[1.5rem] glass-strong border border-black/5 dark:border-white/5 flex items-center gap-6 group hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-[1.02]">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                          <i className="fas fa-check text-xs"></i>
                        </div>
                        <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-300 tracking-tight">{h}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* NARRATIVE SECTION */}
            <section className="bg-gray-100 dark:bg-white/5 py-24 md:py-32">
              <div className="container mx-auto px-6">
                <Reveal variant="slide">
                  <div className="flex flex-col items-center mb-16 text-center">
                    <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.5em] mb-4">The Narrative</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Case Study Breakdown</h3>
                  </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[
                    { title: 'The Challenge', desc: 'Implementing a scalable architecture that handles high-concurrent traffic while maintaining ultra-low latency user interface and consistent design language.', icon: 'fa-triangle-exclamation', color: 'text-orange-500' },
                    { title: 'The Solution', desc: 'Integrated a modern tech stack centered on React and Node.js with distributed database systems and real-time synchronization hooks for maximum responsiveness.', icon: 'fa-lightbulb', color: 'text-blue-600' },
                    { title: 'The Results', desc: 'Successfully deployed a production-ready environment achieving 99.9% uptime and a significant reduction in system overhead compared to legacy frameworks.', icon: 'fa-chart-line', color: 'text-green-500' }
                  ].map((item, i) => (
                    <Reveal key={i} delay={i * 200} variant="3d">
                      <div className="h-full glass-strong p-10 md:p-12 rounded-[2.5rem] border border-white/80 dark:border-white/10 shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-xl mb-8 border border-black/5 dark:border-white/5">
                           <i className={`fas ${item.icon} ${item.color}`}></i>
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

            {/* CALL TO ACTION */}
            <section className="py-32 md:py-48 text-center relative overflow-hidden bg-[#F2F2F7] dark:bg-[#050505]">
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
        </div>

        {/* CUSTOM SHARE MODAL */}
        {isShareOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-scale-in" onClick={() => setIsShareOpen(false)}>
              <div 
                 className="w-full max-w-md bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden"
                 onClick={e => e.stopPropagation()}
              >
                  <div className="p-8 text-center border-b border-black/5 dark:border-white/5 relative">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Project</h3>
                      <button onClick={() => setIsShareOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500">
                          <i className="fas fa-times text-sm"></i>
                      </button>
                  </div>
                  
                  <div className="p-8 grid grid-cols-3 gap-6">
                      <button onClick={handleCopyLink} className="flex flex-col items-center gap-3 group">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xl text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-transform shadow-sm">
                              <i className="fas fa-link"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-500">Copy Link</span>
                      </button>
                      
                      <a 
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-col items-center gap-3 group"
                      >
                          <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-xl text-white dark:text-black group-hover:scale-110 transition-transform shadow-sm">
                              <i className="fab fa-x-twitter"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-500">X</span>
                      </a>

                      <a 
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-col items-center gap-3 group"
                      >
                          <div className="w-14 h-14 rounded-2xl bg-[#0077b5] flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform shadow-sm">
                              <i className="fab fa-linkedin-in"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-500">LinkedIn</span>
                      </a>

                       <a 
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-col items-center gap-3 group"
                      >
                          <div className="w-14 h-14 rounded-2xl bg-[#1877F2] flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform shadow-sm">
                              <i className="fab fa-facebook-f"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-500">Facebook</span>
                      </a>

                      <a 
                          href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-col items-center gap-3 group"
                      >
                          <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform shadow-sm">
                              <i className="fab fa-whatsapp"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-500">WhatsApp</span>
                      </a>
                  </div>
              </div>
          </div>
        )}

        {/* CONTACT MODAL */}
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl overflow-y-auto animate-fade-in flex flex-col">
            <div className="flex-1 flex items-center justify-center p-0 md:p-4">
              <Contact onSuccess={() => setIsContactModalOpen(false)} onClose={() => setIsContactModalOpen(false)} isModal={true} />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ProjectPage;