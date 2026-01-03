import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import Layout from './Layout';
import Footer from './Footer';
import Reveal from './Reveal';

/**
 * Enhanced mapping logic to assign professional brand icons and colors.
 * Prioritizes framework-specific icons over generic language icons.
 */
const getTechIcon = (tech: string) => {
  const t = tech.toLowerCase().trim();

  // 1. SPECIFIC FRAMEWORKS & TOOLS (Highest Priority)
  if (t.includes('vite')) return { icon: 'fas fa-bolt', color: 'text-[#646CFF]' };
  if (t.includes('tailwind')) return { icon: 'fas fa-wind', color: 'text-[#06B6D4]' };
  if (t.includes('next')) return { icon: 'fas fa-layer-group', color: 'text-gray-900 dark:text-white' };
  if (t.includes('react')) return { icon: 'fab fa-react', color: 'text-[#61DAFB]' };
  if (t.includes('flutter')) return { icon: 'fas fa-mobile-screen', color: 'text-[#02569B]' };
  if (t.includes('pwa') || t.includes('manifest')) return { icon: 'fas fa-mobile-screen-button', color: 'text-[#5A0FC8]' };
  if (t.includes('leaflet')) return { icon: 'fas fa-map-location-dot', color: 'text-[#199900]' };
  if (t.includes('openstreetmap') || t.includes('osm')) return { icon: 'fas fa-map', color: 'text-[#7EBC6F]' };
  if (t.includes('wordpress')) return { icon: 'fab fa-wordpress', color: 'text-[#21759B]' };

  // 2. LANGUAGES & CORE TECH
  if (t.includes('typescript') || t === 'ts') return { icon: 'fas fa-code', color: 'text-[#3178C6]' };
  if (t.includes('javascript') || t === 'js') return { icon: 'fab fa-js', color: 'text-[#F7DF1E]' };
  if (t.includes('html')) return { icon: 'fab fa-html5', color: 'text-[#E34F26]' };
  if (t.includes('css')) return { icon: 'fab fa-css3-alt', color: 'text-[#1572B6]' };
  if (t.includes('python')) return { icon: 'fab fa-python', color: 'text-[#3776AB]' };
  if (t.includes('php')) return { icon: 'fab fa-php', color: 'text-[#777BB4]' };
  if (t.includes('node')) return { icon: 'fab fa-node-js', color: 'text-[#339933]' };
  if (t === 'c' || t === 'cpp' || t.includes('c++')) return { icon: 'fas fa-microchip', color: 'text-[#A8B9CC]' };

  // 3. DATABASES & BACKEND
  if (t.includes('firebase')) return { icon: 'fas fa-fire', color: 'text-[#FFCA28]' };
  if (t.includes('mongo')) return { icon: 'fas fa-leaf', color: 'text-[#47A248]' };
  if (t.includes('mysql') || t.includes('sql') || t.includes('postgres')) return { icon: 'fas fa-database', color: 'text-[#4479A1]' };

  // 4. DESIGN & APIS
  if (t.includes('figma')) return { icon: 'fab fa-figma', color: 'text-[#F24E1E]' };
  if (t.includes('canva')) return { icon: 'fas fa-palette', color: 'text-[#00C4CC]' };
  if (t.includes('photoshop') || t.includes('adobe')) return { icon: 'fas fa-image', color: 'text-[#31A8FF]' };
  if (t.includes('github') || t.includes('git')) return { icon: 'fab fa-github', color: 'text-gray-900 dark:text-white' };
  if (t.includes('api')) return { icon: 'fas fa-gears', color: 'text-gray-500' };

  // 5. AI & BOTs
  if (t.includes('ai') || t.includes('ml') || t.includes('intelligence') || t.includes('gemini') || t.includes('gpt')) return { icon: 'fas fa-brain', color: 'text-[#8B5CF6]' };
  if (t.includes('bot') || t.includes('chat')) return { icon: 'fas fa-robot', color: 'text-[#3B82F6]' };

  return { icon: 'fas fa-cube', color: 'text-blue-500' };
};

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

  const techItems = project.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean);

  return (
    <Layout>
      <div className="bg-[#F2F2F7] dark:bg-[#050505] min-h-screen transition-colors duration-1000">
        
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

        {/* Hero Section: Corporate Split Layout */}
        <header className="container mx-auto px-6 pt-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Left: Device / Project View */}
            <Reveal variant="rotate-left" triggerOnMount>
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="relative glass-strong rounded-[2.5rem] p-2 md:p-3 overflow-hidden border border-white/60 dark:border-white/10 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)]">
                  <div className="rounded-[1.8rem] overflow-hidden bg-gray-100 dark:bg-black/20 aspect-[16/10]">
                    <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105" 
                    />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: Metadata */}
            <Reveal variant="skew-up" triggerOnMount delay={200}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">
                    {project.category || 'System Architecture'}
                  </span>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-ultra leading-[0.9]">
                    {project.title}
                  </h1>
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
                  <a href="#contact" className="px-10 py-5 rounded-2xl glass-strong border border-black/5 dark:border-white/10 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-white dark:hover:bg-white/5 flex items-center justify-center gap-3">
                    Inquire Similar
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </header>

        {/* Technologies Section - Bento Grid */}
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

        {/* Key Highlights - Checklist UI */}
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

        {/* Case Study Grid - Narrative UI */}
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
                    onClick={() => window.location.hash = '#contact'}
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
    </Layout>
  );
};

export default ProjectPage;