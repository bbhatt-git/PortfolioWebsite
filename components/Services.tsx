import React from 'react';
import Reveal from './Reveal';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-6">
        <Reveal>
          <div className="mb-16">
             <h2 className="text-4xl font-bold mb-4 tracking-tight">Services.</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-xl">
               High-quality digital solutions tailored to your needs.
             </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => (
            <Reveal key={index} delay={index * 100} className="glass rounded-[2rem] p-8 hover:bg-white/80 dark:hover:bg-[#1c1c1e] transition-all duration-300 hover:scale-[1.02] cursor-default border border-transparent hover:border-black/5 dark:hover:border-white/10 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <i className={`fas ${service.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {service.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;