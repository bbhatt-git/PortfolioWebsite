import React from 'react';
import Reveal from './Reveal';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="skew-up">
          <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
             <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                 Services.
               </span>
             </h2>
             <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
               Crafting digital experiences with precision. I offer a range of services to help you build your online presence and scale your business.
             </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((service, index) => (
            <Reveal key={index} delay={index * 100} variant="zoom-in" className="h-full">
                <div className="group relative h-full rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2">
                    {/* Liquid Border/Glow Effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 rounded-[2.5rem] opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
                    
                    {/* Main Card */}
                    <div className="relative h-full bg-white/60 dark:bg-[#121212]/60 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-10 border border-white/20 dark:border-white/5 overflow-hidden">
                        {/* Hover Liquid Blob */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] group-hover:scale-[2.5] transition-transform duration-700 ease-out-expo pointer-events-none"></div>
                        
                        {/* Icon */}
                        <div className="relative w-16 h-16 mb-8">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                            <div className="relative w-full h-full bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/10 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <i className={`fas ${service.icon} text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-purple-600 transition-all`}></i>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform duration-300">{service.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-6 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                            {service.desc}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                           <span className="relative">
                             Learn more
                             <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-600 dark:bg-blue-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                           </span>
                           <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
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

export default Services;