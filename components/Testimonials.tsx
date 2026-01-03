import React, { useState, useRef, useEffect } from 'react';
import Reveal from './Reveal';
import { TESTIMONIALS } from '../constants';
import { Testimonial } from '../types';

const Testimonials: React.FC = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Remove the first testimonial as requested and duplicate for infinite loop
  const filteredTestimonials = TESTIMONIALS.slice(1);
  const duplicatedTestimonials = [...filteredTestimonials, ...filteredTestimonials, ...filteredTestimonials];

  const openModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
  };

  const closeModal = () => {
    setSelectedTestimonial(null);
  };

  useEffect(() => {
    if (selectedTestimonial) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedTestimonial]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const container = scrollRef.current;
        const scrollAmount = window.innerWidth * 0.85; 
        
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-black/80 pointer-events-none z-0"></div>
      
      {/* SECTION LIQUID ORB */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] animate-liquid pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="skew-up">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-black dark:text-white">
                Trusted by Innovators
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
                Don't just take my word for it. Here's what clients and collaborators have to say about our work together.
            </p>
          </div>
        </Reveal>

        {/* Improved Marquee Container - Replaced buggy masking with gradient overlays */}
        <div 
          ref={scrollRef}
          className="relative w-full overflow-x-auto md:overflow-hidden pb-4 md:pb-0 scroll-smooth touch-pan-x z-20 snap-x snap-mandatory md:snap-none no-scrollbar"
        >
           {/* Side Fades - Replaces buggy CSS mask-image for cleaner visual edge */}
           <div className="absolute inset-y-0 left-0 w-8 md:w-32 bg-gradient-to-r from-[#F2F2F7] dark:from-[#050505] to-transparent z-20 pointer-events-none hidden md:block"></div>
           <div className="absolute inset-y-0 right-0 w-8 md:w-32 bg-gradient-to-l from-[#F2F2F7] dark:from-[#050505] to-transparent z-20 pointer-events-none hidden md:block"></div>
           
           <div className="flex w-max md:animate-marquee hover:[animation-play-state:paused] px-4 md:px-0">
             {duplicatedTestimonials.map((testi, index) => (
                 <div 
                    key={`${testi.id}-${index}`} 
                    onClick={() => openModal(testi)}
                    className="w-[85vw] sm:w-[350px] md:w-[400px] flex-shrink-0 mr-4 md:mr-8 group relative cursor-pointer snap-center"
                 >
                    {/* Simplified Card Design - Removed distorted overlay gradient */}
                    <div className="h-full flex flex-col p-6 md:p-8 rounded-[2.5rem] bg-white/60 dark:bg-[#161618]/60 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80 dark:hover:bg-[#161618]/80">
                        
                        <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                           <i className="fas fa-quote-right text-4xl md:text-5xl text-black dark:text-white"></i>
                        </div>

                        <div className="flex gap-1 mb-6 text-yellow-400 text-xs relative z-10">
                            {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star drop-shadow-sm"></i>)}
                        </div>

                        <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-8 flex-1 relative z-10 italic line-clamp-4">
                          "{testi.text}"
                        </p>

                        <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-black/5 dark:border-white/5 group-hover:border-blue-500/20 transition-colors">
                           <img 
                            src={testi.image} 
                            alt={testi.name} 
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50 dark:ring-white/5"
                          />
                          <div>
                             <h4 className="text-sm font-bold text-black dark:text-white">{testi.name}</h4>
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{testi.role}</p>
                          </div>
                        </div>
                    </div>
                 </div>
             ))}
           </div>
        </div>

        <div className="flex justify-center gap-4 mt-8 md:hidden relative z-20">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-700 dark:text-white shadow-lg"><i className="fas fa-arrow-left"></i></button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-700 dark:text-white shadow-lg"><i className="fas fa-arrow-right"></i></button>
        </div>
      </div>

      {/* Redesigned Testimonial Modal - Pure Glassmorphism Aesthetic */}
      {selectedTestimonial && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-scale-in" 
          onClick={closeModal}
        >
           <div 
             className="w-full max-w-xl bg-white/40 dark:bg-[#161618]/40 backdrop-blur-[40px] rounded-[3rem] shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden relative ring-1 ring-black/5 dark:ring-white/5"
             onClick={e => e.stopPropagation()}
           >
              {/* Internal Refraction Light */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Traffic Light Actions (macOS Style) */}
              <div className="absolute top-6 left-8 flex gap-1.5 z-20">
                <div onClick={closeModal} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:bg-[#FF4A40] transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
              </div>

              <div className="p-10 md:p-14 relative z-10 flex flex-col items-center text-center">
                 <div className="relative mb-8 group">
                    <img 
                      src={selectedTestimonial.image} 
                      alt={selectedTestimonial.name} 
                      className="w-28 h-28 rounded-full object-cover border-4 border-white/80 dark:border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-600 border-4 border-white dark:border-[#252528] flex items-center justify-center text-white text-xs shadow-lg">
                      <i className="fas fa-check"></i>
                    </div>
                 </div>

                 <div className="flex gap-1.5 mb-8 text-yellow-400 text-xl">
                    {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star drop-shadow-sm"></i>)}
                 </div>

                 <p className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 leading-relaxed font-light italic mb-10 tracking-tight">
                    "{selectedTestimonial.text}"
                 </p>

                 <div className="pt-8 border-t border-black/5 dark:border-white/5 w-full">
                    <h3 className="text-2xl font-bold text-black dark:text-white mb-1">{selectedTestimonial.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">{selectedTestimonial.role}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;