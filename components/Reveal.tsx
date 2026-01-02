import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number; // delay in ms
  className?: string;
  variant?: 'fade' | 'slide' | '3d';
}

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '', variant = '3d' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { 
        threshold: 0.05, 
        rootMargin: "0px 0px -20px 0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const style = {
    transitionDelay: `${delay}ms`,
  };

  // 3D fold-up animation classes - softened for fluid feel
  const hiddenState = variant === '3d' 
    ? 'opacity-0 translate-y-10 scale-[0.98] rotate-x-6' 
    : 'opacity-0 translate-y-6';
    
  const visibleState = 'opacity-100 translate-y-0 scale-100 rotate-x-0';

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all duration-[1200ms] ease-expo perspective-1000 will-change-[transform,opacity] ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;