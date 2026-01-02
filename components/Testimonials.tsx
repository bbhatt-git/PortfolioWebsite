import React from 'react';
import Reveal from './Reveal';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal>
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-black dark:text-white">What Clients Say</h2>
            <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testi, index) => (
            <Reveal key={testi.id} delay={index * 150}>
              <div className="h-full flex flex-col p-8 rounded-[2rem] glass-strong border border-white/40 dark:border-white/5 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-2">
                
                {/* Large Quote Icon */}
                <div className="mb-6">
                   <i className="fas fa-quote-left text-4xl text-blue-500/20 group-hover:text-blue-500/40 transition-colors"></i>
                </div>

                {/* Review Text */}
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-light mb-8 flex-1">
                  {testi.text}
                </p>

                {/* Client Info */}
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
                   <img 
                    src={testi.image} 
                    alt={testi.name} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-white/10"
                  />
                  <div>
                     <h4 className="text-base font-bold text-black dark:text-white">{testi.name}</h4>
                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{testi.role}</p>
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