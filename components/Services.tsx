import React, { useState, useEffect } from 'react';
import Reveal from './Reveal';
import { SERVICES } from '../constants';
import { Service } from '../types';

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const openModal = (service: Service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  useEffect(() => {
    if (selectedService) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedService]);

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background Decor - Subtle and distant */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-black/80 pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="skew-up">
          <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
             <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                My Expertise
             </div>
             <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
               <span className="text-gray-900 dark:text-white">
                 World-Class Services.
               </span>
             </h2>
             <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
               Crafting digital experiences with precision. I offer a range of services to help you build your online presence and scale your business.
             </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <Reveal key={index} delay={index * 100} variant="zoom-in" className="h-full">
                <div 
                  onClick={() => openModal(service)}
                  data-bot-msg={`Ah, ${service.title}! We excel at this.|Looking for ${service.title}? I can help.|Top-notch ${service.title} services here.|Click to see details about ${service.title}.`}
                  className="group relative h-full rounded-[2.5rem] cursor-pointer"
                >
                    {/* Card Content - Subtle glass interaction instead of neon */}
                    <div className="relative h-full bg-white/50 dark:bg-[#121212]/40 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-10 border border-white/40 dark:border-white/5 overflow-hidden shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-white/80 dark:group-hover:bg-[#1c1c20]/60 group-hover:border-white/80 dark:group-hover:border-white/10 group-hover:shadow-2xl group-hover:shadow-black/5 dark:group-hover:shadow-black/40">
                        
                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
                        
                        {/* Inner Light Reflection (Top Left) */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 opacity-40 pointer-events-none rounded-[2.4rem]"></div>

                        {/* Minimalist Icon Container */}
                        <div className="relative w-16 h-16 mb-8 group-hover:scale-105 transition-transform duration-500 ease-out-expo">
                            <div className="relative w-full h-full bg-gray-100 dark:bg-[#1E1E20] backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 flex items-center justify-center text-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                                <i className={`fas ${service.icon} text-gray-800 dark:text-gray-200 transition-all`}></i>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300 relative z-10">{service.title}</h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-8 relative z-10">
                            {service.desc}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto relative z-10 pt-6 border-t border-black/5 dark:border-white/5">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Know More</span>
                           <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                               <i className="fas fa-arrow-right text-xs transform group-hover:-rotate-45 transition-transform duration-300"></i>
                           </div>
                        </div>
                    </div>
                </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-scale-in" onClick={closeModal}>
           <div 
             className="w-full max-w-2xl bg-white/60 dark:bg-[#161618]/50 backdrop-blur-[40px] rounded-[3rem] shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden relative flex flex-col max-h-[85vh] ring-1 ring-black/5 dark:ring-white/5"
             onClick={e => e.stopPropagation()}
           >
              {/* Internal Refraction Light */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Traffic Lights - Hidden on Mobile */}
              <div className="absolute top-6 left-8 hidden md:flex gap-1.5 z-20">
                <div onClick={closeModal} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
              </div>

              {/* Close Button Mobile - Redesigned to be more prominent on mobile */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 md:hidden w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white z-20 backdrop-blur-md border border-white/20"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="p-8 md:p-14 relative z-10 overflow-y-auto custom-scrollbar">
                 <div className="w-20 h-20 rounded-3xl bg-white/80 dark:bg-[#252528]/80 shadow-xl flex items-center justify-center text-4xl text-gray-800 dark:text-white mb-8 border border-white/60 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
                    <i className={`fas ${selectedService.icon}`}></i>
                 </div>

                 <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">{selectedService.title}</h3>
                 
                 <div className="bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-black/5 dark:border-white/5 mb-10 shadow-inner">
                     <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-light">
                        {selectedService.details || selectedService.desc}
                     </p>
                 </div>

                 {selectedService.features && (
                   <div className="mb-10">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800"></span> Capabilities
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedService.features.map((feature, idx) => (
                           <li key={idx} className="flex items-center gap-4 text-gray-800 dark:text-gray-100 p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/60 dark:border-white/5 transition-all hover:bg-white/50 dark:hover:bg-white/10 cursor-default group">
                              <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                                <i className="fas fa-check text-[10px]"></i>
                              </div>
                              <span className="font-bold text-xs tracking-tight uppercase">{feature}</span>
                           </li>
                        ))}
                      </ul>
                   </div>
                 )}

                 <div className="flex gap-4 pt-6">
                    <button 
                        onClick={() => {
                            closeModal();
                            const contact = document.getElementById('contact');
                            if (contact) contact.scrollIntoView({ behavior: 'smooth' });
                        }}
                        data-bot-msg="Scheduling a call? Great idea!|Let's talk business.|I'll open the calendar."
                        className="flex-1 py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                    >
                        Schedule a Call <i className="fas fa-arrow-right text-sm"></i>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </section>
  );
};

export default Services;