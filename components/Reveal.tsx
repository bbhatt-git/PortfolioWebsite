import React, { useEffect, useRef, useState } from 'react';

// Simplified variants only. 
// Note: We keep the Type definition to prevent TypeScript errors in files that use the old names,
// but we map them all to simple animations internally.
type RevealVariant = 
  | 'fade' 
  | 'slide' 
  | '3d' 
  | 'rotate-left' 
  | 'rotate-right'
  | 'zoom-in' 
  | 'flip-up'
  | 'skew-up'
  | 'hologram'      
  | 'matrix-zoom'   
  | 'book-open'     
  | 'deck-shuffle'  
  | 'turbine'       
  | 'slit-scan';    

interface RevealProps {
  children: React.ReactNode;
  delay?: number; // delay in ms
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
  duration = 500, // Fast, crisp duration
  triggerOnMount = false,
  threshold = 0.15
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { 
        threshold: threshold,
        rootMargin: "0px 0px -50px 0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnMount, threshold]);

  // Clean, professional easing (Quart Out)
  const cleanEase = 'cubic-bezier(0.25, 1, 0.5, 1)';

  const style: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: cleanEase,
    willChange: 'opacity, transform',
    // Removed transformStyle: 'preserve-3d' to flatten the render
  };

  // Base state: usually hidden
  let hiddenState = '';
  // Target state: usually visible/reset
  const visibleState = 'opacity-100 transform-none filter-none';

  // MAPPING EVERYTHING TO MINIMALIST ANIMATIONS
  switch (variant) {
    case 'zoom-in':
    case 'matrix-zoom': // Remapped
    case 'hologram':    // Remapped
      hiddenState = 'opacity-0 scale-95';
      break;

    case 'rotate-left':
    case 'book-open':   // Remapped
      hiddenState = 'opacity-0 -translate-x-4';
      break;

    case 'rotate-right':
      hiddenState = 'opacity-0 translate-x-4';
      break;

    case 'fade':
      hiddenState = 'opacity-0';
      break;
      
    case 'slide':
    case '3d':          // Remapped
    case 'flip-up':     // Remapped
    case 'skew-up':     // Remapped
    case 'deck-shuffle': // Remapped
    case 'turbine':     // Remapped
    case 'slit-scan':   // Remapped
    default:
      // Default Professional Fade Up
      hiddenState = 'opacity-0 translate-y-6';
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