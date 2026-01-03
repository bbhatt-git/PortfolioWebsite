import React, { useState } from 'react';
import Reveal from './Reveal';
import { SERVICES } from '../constants';
import { Service } from '../types';

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const openModal = (service: Service) => {
    setSelectedService(service);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'auto';
  };

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
                <div 
                  onClick={() => openModal(service)}
                  className="group relative h-full rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3 hover:cursor-pointer"
                >
                    {/* Liquid Border/Glow Effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 rounded-[2.5rem] opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
                    
                    {/* Main Card */}
                    <div className="relative h-full bg-white/60 dark:bg-[#121212]/60 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-10 border border-white/20 dark:border-white/5 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                        {/* Hover Liquid Blob */}
                        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700 ease-out-expo pointer-events-none"></div>
                        
                        {/* Icon */}
                        <div className="relative w-16 h-16 mb-8 group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                            <div className="relative w-full h-full bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/10 flex items-center justify-center text-2xl shadow-lg">
                                <i className={`fas ${service.icon} text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-purple-600 transition-all`}></i>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{service.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-6 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                            {service.desc}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mt-auto">
                           <span className="relative">
                             View Details
                             <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-600 dark:bg-blue-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                           </span>
                           <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-300"></i>
                        </div>
                    </div>
                </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-scale-in" onClick={closeModal}>
           <div 
             className="w-full max-w-2xl bg-white/90 dark:bg-[#161618]/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative"
             onClick={e => e.stopPropagation()}
           >
              {/* Header Decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none"></div>
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-500/30 rounded-full blur-[60px]"></div>

              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors z-20 text-black dark:text-white"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="p-8 md:p-10 relative z-10">
                 {/* Icon */}
                 <div className="w-20 h-20 rounded-3xl bg-white dark:bg-white/10 shadow-xl flex items-center justify-center text-3xl md:text-4xl text-blue-600 dark:text-blue-400 mb-6 border border-white/40 dark:border-white/10">
                    <i className={`fas ${selectedService.icon}`}></i>
                 </div>

                 <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{selectedService.title}</h3>
                 
                 <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-light">
                   {selectedService.details || selectedService.desc}
                 </p>

                 {selectedService.features && (
                   <div className="mb-10">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Key Features</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedService.features.map((feature, idx) => (
                           <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                              <i className="fas fa-check-circle text-green-500"></i>
                              <span className="font-medium text-sm">{feature}</span>
                           </li>
                        ))}
                      </ul>
                   </div>
                 )}

                 <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            closeModal();
                            const contact = document.getElementById('contact');
                            if (contact) contact.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Get Started <i className="fas fa-arrow-right"></i>
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