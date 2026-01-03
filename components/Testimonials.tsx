import React, { useState, useRef, useEffect } from 'react';
import Reveal from './Reveal';
import { TESTIMONIALS } from '../constants';
import { Testimonial } from '../types';

const Testimonials: React.FC = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Create a duplicated list for seamless looping (primarily for desktop marquee)
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  const openModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    document.body.style.overflow = 'hidden';
    setIsPaused(true); // Pause auto-scroll when modal is open
  };

  const closeModal = () => {
    setSelectedTestimonial(null);
    document.body.style.overflow = 'auto';
    setIsPaused(false);
  };

  // Auto-scroll logic for mobile
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;

    const scroll = () => {
        // Only run auto-scroll logic on mobile devices (< 768px) where we use overflow-x-auto
        // AND when not paused by user interaction
        if (!isPaused && window.innerWidth < 768) { 
             // Using 1px speed to ensure movement on all pixel densities
             scrollContainer.scrollLeft += 1; 

             // Infinite scroll reset logic
             // If we have scrolled past half the content (the first set of testimonials), reset to 0
             // We use scrollWidth / 2 because the list is exactly duplicated
             if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth / 2)) {
                 scrollContainer.scrollLeft = 0;
             }
        }
        animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-black/80 pointer-events-none z-0"></div>

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

        {/* 
            Container with Scroll Logic:
            - Desktop (md+): overflow-hidden (for Marquee)
            - Mobile: overflow-x-auto (for Swipe) + JS Auto Scroll
            - Removed snap-x/snap-mandatory to prevent fighting with JS auto-scroll
        */}
        <div 
          ref={scrollRef}
          className="relative w-full overflow-x-auto md:overflow-hidden mask-image-linear-gradient pb-4 md:pb-0 scroll-smooth touch-pan-x z-20"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} /* Hide scrollbar Firefox/IE */
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
              // Delay before resuming to allow fling to settle
              setTimeout(() => setIsPaused(false), 2000);
          }}
        >
           {/* Fade edges - pointer events none allows scrolling through them */}
           <div className="absolute inset-y-0 left-0 w-8 md:w-32 bg-gradient-to-r from-[#F2F2F7] dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
           <div className="absolute inset-y-0 right-0 w-8 md:w-32 bg-gradient-to-l from-[#F2F2F7] dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
           
           {/* Webkit scrollbar hide style injection */}
           <style>{`
             .no-scrollbar::-webkit-scrollbar {
               display: none;
             }
           `}</style>

           {/* 
              Inner Flex Container:
              - Desktop (md+): animate-marquee active
              - Mobile: No animation, just flex items for scrolling
           */}
           <div className="flex w-max md:animate-marquee hover:[animation-play-state:paused] px-6 md:px-0 no-scrollbar">
             {duplicatedTestimonials.map((testi, index) => (
                 <div 
                    key={`${testi.id}-${index}`} 
                    onClick={() => openModal(testi)}
                    className="w-[85vw] sm:w-[350px] md:w-[400px] flex-shrink-0 mr-4 md:mr-8 group relative cursor-pointer"
                 >
                    <div className="h-full flex flex-col p-6 md:p-8 rounded-[2.5rem] bg-white/40 dark:bg-[#161618]/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-[#161618]/60">
                        {/* Glass Shine */}
                        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>
                        
                        {/* Quote Icon */}
                        <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                           <i className="fas fa-quote-right text-4xl md:text-5xl text-black dark:text-white"></i>
                        </div>

                        {/* Stars */}
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
                          
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                             <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white">
                                <i className="fas fa-expand-alt text-xs"></i>
                             </div>
                          </div>
                        </div>
                    </div>
                 </div>
             ))}
           </div>
        </div>
      </div>

      {/* Testimonial Modal Overlay */}
      {selectedTestimonial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-scale-in" onClick={closeModal}>
           <div 
             className="w-full max-w-2xl bg-white/90 dark:bg-[#161618]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative"
             onClick={e => e.stopPropagation()}
           >
              {/* Header Decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px]"></div>

              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors z-20 text-black dark:text-white"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
                 
                 {/* Large Image */}
                 <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20"></div>
                    <img 
                        src={selectedTestimonial.image} 
                        alt={selectedTestimonial.name} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#252528] shadow-xl relative z-10"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-[#161618] z-20">
                        <i className="fas fa-quote-right text-xs"></i>
                    </div>
                 </div>

                 {/* Stars */}
                 <div className="flex gap-1.5 mb-8 text-yellow-400 text-lg">
                    {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star drop-shadow-sm"></i>)}
                 </div>

                 {/* Quote Text */}
                 <div className="relative mb-8">
                     <i className="fas fa-quote-left absolute -top-4 -left-6 text-3xl text-gray-300 dark:text-gray-700 opacity-30"></i>
                     <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 leading-relaxed font-medium italic">
                        "{selectedTestimonial.text}"
                     </p>
                     <i className="fas fa-quote-right absolute -bottom-4 -right-6 text-3xl text-gray-300 dark:text-gray-700 opacity-30"></i>
                 </div>

                 <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>

                 {/* Author Info */}
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