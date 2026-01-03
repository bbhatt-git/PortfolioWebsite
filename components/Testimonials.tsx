import React from 'react';
import Reveal from './Reveal';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  // Create a duplicated list for seamless looping
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

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

        {/* Marquee Slider Container */}
        <div className="relative w-full overflow-hidden mask-image-linear-gradient">
           {/* Fade edges */}
           <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#F2F2F7] dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
           <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#F2F2F7] dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>

           {/* 
              FLAT LIST APPROACH:
              Using a single flex container with margins on items ensures mathematically perfect looping.
              Flex gap can cause sub-pixel offsets or calculation errors with percentage-based translation.
              
              Logic:
              1. We duplicate the list (Set A + Set B).
              2. Animation translates -50%.
              3. At -50%, Set B is exactly where Set A started, creating a seamless jump back to 0.
           */}
           <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
             {duplicatedTestimonials.map((testi, index) => (
                 <div 
                    key={`${testi.id}-${index}`} 
                    className="w-[85vw] sm:w-[350px] md:w-[400px] flex-shrink-0 mr-6 md:mr-8 group relative"
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

                        <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-8 flex-1 relative z-10 italic">
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
      </div>
    </section>
  );
};

export default Testimonials;