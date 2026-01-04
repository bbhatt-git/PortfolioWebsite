import React, { useEffect, useRef, useState } from 'react';

type RevealVariant = 
  | 'fade' 
  | 'slide' 
  | 'zoom-in' 
  | '3d' 
  | 'skew-up'
  | 'slit-scan'
  | 'hologram'
  | 'matrix-zoom'
  | 'book-open'
  | 'deck-shuffle'
  | 'turbine';

interface RevealProps {
  children: React.ReactNode;
  delay?: number; 
  className?: string;
  variant?: RevealVariant;
  duration?: number;
  triggerOnMount?: boolean;
  threshold?: number;
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  delay = 0, 
  className = '', 
  variant = 'fade',
  duration = 500, // Premium speed
  triggerOnMount = false,
  threshold = 0.1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnMount, threshold]);

  // Professional Expo curve for "instant" feel
  const cleanEase = 'cubic-bezier(0.16, 1, 0.3, 1)';

  const style: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: cleanEase,
    willChange: 'opacity, transform',
  };

  let hiddenState = '';
  const visibleState = 'opacity-100 transform-none';

  switch (variant) {
    case 'slide':
    case '3d':
    case 'skew-up':
      hiddenState = 'opacity-0 translate-y-12';
      break;
    case 'zoom-in':
    case 'matrix-zoom':
    case 'hologram':
      hiddenState = 'opacity-0 scale-95';
      break;
    case 'slit-scan':
    case 'turbine':
      hiddenState = 'opacity-0 -translate-y-6 scale-105';
      break;
    case 'book-open':
    case 'deck-shuffle':
      hiddenState = 'opacity-0 translate-x-12';
      break;
    case 'fade':
    default:
      hiddenState = 'opacity-0';
      break;
  }

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;