import React from 'react';
import Reveal from './Reveal';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-black/80 pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="skew-up">
          <div className="mb-20 text-center max-w-2xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testi, index) => (
            <Reveal key={testi.id} delay={index * 150} variant="rotate-left" className="h-full">
              <div className="group relative h-full">
                 {/* Card Backing/Glow */}
                 <div className="absolute inset-2 bg-blue-500/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                 <div className="relative h-full flex flex-col p-8 md:p-10 rounded-[2.5rem] bg-white/40 dark:bg-[#161618]/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 dark:hover:bg-[#161618]/60">
                    
                    {/* Glass Shine */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>

                    {/* Large Quote Icon */}
                    <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:rotate-12">
                       <i className="fas fa-quote-right text-6xl text-black dark:text-white"></i>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-8 text-yellow-400 text-sm relative z-10">
                        {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star drop-shadow-sm"></i>)}
                    </div>

                    {/* Review Text */}
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-10 flex-1 relative z-10 italic">
                      "{testi.text}"
                    </p>

                    {/* Client Info */}
                    <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-black/5 dark:border-white/5 group-hover:border-blue-500/20 transition-colors">
                       <div className="relative">
                           <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                           <img 
                            src={testi.image} 
                            alt={testi.name} 
                            className="w-14 h-14 rounded-full object-cover ring-4 ring-white/50 dark:ring-white/5 relative z-10"
                          />
                       </div>
                      <div>
                         <h4 className="text-base font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{testi.name}</h4>
                         <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{testi.role}</p>
                      </div>
                    </div>
                 </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;