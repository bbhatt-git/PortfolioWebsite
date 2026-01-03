import React, { useState, useRef } from 'react';
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
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedTestimonial(null);
    document.body.style.overflow = 'auto';
  };

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

        {/* Improved Marquee Container - Fixed Masking Issues */}
        <div 
          ref={scrollRef}
          className="relative w-full overflow-x-auto md:overflow-hidden pb-4 md:pb-0 scroll-smooth touch-pan-x z-20 snap-x snap-mandatory md:snap-none no-scrollbar"
        >
           {/* Side Fades - Replaces buggy CSS mask-image */}
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
                    <div className="h-full flex flex-col p-6 md:p-8 rounded-[2.5rem] bg-white/50 dark:bg-[#161618]/50 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/70 dark:hover:bg-[#161618]/70">
                        
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

      {selectedTestimonial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={closeModal}>
           <div 
             className="w-full max-w-2xl bg-white/90 dark:bg-[#161618]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative"
             onClick={e => e.stopPropagation()}
           >
              <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors z-20 text-black dark:text-white">
                <i className="fas fa-times"></i>
              </button>

              <div className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
                 <img src={selectedTestimonial.image} alt={selectedTestimonial.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#252528] shadow-xl mb-6"/>
                 <div className="flex gap-1.5 mb-8 text-yellow-400 text-lg">
                    {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star drop-shadow-sm"></i>)}
                 </div>
                 <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 leading-relaxed font-medium italic mb-8">"{selectedTestimonial.text}"</p>
                 <h3 className="text-2xl font-bold text-black dark:text-white mb-1">{selectedTestimonial.name}</h3>
                 <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm">{selectedTestimonial.role}</p>
              </div>
           </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;