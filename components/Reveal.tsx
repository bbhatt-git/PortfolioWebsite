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
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const style = {
    transitionDelay: `${delay}ms`,
    willChange: 'transform, opacity, filter',
  };

  // Professional 3D Scroll Animation
  // Start: Tilted back 45deg, pushed down 60px, scaled down to 0.9, transparent, and blurred
  // This creates a "cinematic" focus pull effect as elements enter the viewport.
  const hiddenState = variant === '3d' 
    ? 'opacity-0 [transform:perspective(1000px)_rotateX(45deg)_translateY(60px)_scale(0.9)] blur-[6px]'
    : 'opacity-0 translate-y-12 blur-[4px]';
    
  // End: Reset all transforms, fully opaque, crisp focus
  const visibleState = 'opacity-100 [transform:perspective(1000px)_rotateX(0deg)_translateY(0)_scale(1)] blur-0';

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all duration-[1200ms] ease-out-expo ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;