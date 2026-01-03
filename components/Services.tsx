import React from 'react';
import Reveal from './Reveal';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <Reveal variant="skew-up">
          <div className="mb-12 md:mb-16">
             <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Services.</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-xl">
               High-quality digital solutions tailored to your needs.
             </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((service, index) => (
            <Reveal key={index} delay={index * 100} variant="zoom-in" className="h-full">
                <div className="glass rounded-[2rem] p-8 h-full hover:bg-white/80 dark:hover:bg-[#1c1c1e] transition-all duration-300 hover:scale-[1.02] cursor-default border border-transparent hover:border-black/5 dark:hover:border-white/10 group flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <i className={`fas ${service.icon}`}></i>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm flex-1">
                        {service.desc}
                    </p>
                </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;