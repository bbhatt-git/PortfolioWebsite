import React, { useEffect, useRef, useState } from 'react';

type RevealVariant = 
  | 'fade' 
  | 'slide' 
  | '3d' 
  | 'rotate-left' 
  | 'rotate-right'
  | 'zoom-in' 
  | 'flip-up'
  | 'skew-up'
  // NEW CINEMATIC VARIANTS
  | 'hologram'      // Pops up with scale and heavy blur fade
  | 'matrix-zoom'   // Flies in from deep Z-space
  | 'book-open'     // Unfolds like a book
  | 'deck-shuffle'  // Slides in like cards dealing
  | 'turbine'       // Rotates in circular motion
  | 'slit-scan';    // Expands vertically with 3D rotation

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
  variant = '3d',
  duration = 600, // FAST: Slashed from 1200 to 600 for instant snappy feel
  triggerOnMount = false,
  threshold = 0.1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (triggerOnMount) {
      // Almost instant trigger
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
      { 
        threshold: threshold,
        rootMargin: "0px 0px -50px 0px" // Trigger earlier
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnMount, threshold]);

  // Using a spring-like bezier for "pop" effect
  const springBezier = 'cubic-bezier(0.175, 0.885, 0.32, 1.1)';

  const style: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: springBezier,
    willChange: 'transform, opacity, filter',
    transformStyle: 'preserve-3d',
  };

  // Base state: usually hidden
  let hiddenState = '';
  // Target state: usually visible/reset
  let visibleState = 'opacity-100 [transform:translate3d(0,0,0)_rotateX(0)_rotateY(0)_scale(1)] blur-0 filter-none';

  switch (variant) {
    // --- LEGACY VARIANTS ---
    case 'rotate-left':
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateY(-25deg)_translateX(-30px)_translateZ(-100px)] blur-[4px] origin-left';
      break;
    case 'rotate-right':
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateY(25deg)_translateX(30px)_translateZ(-100px)] blur-[4px] origin-right';
      break;
    case 'zoom-in':
      hiddenState = 'opacity-0 [transform:scale(0.8)_translateY(20px)] blur-[0px]';
      break;
    case 'flip-up':
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateX(90deg)_translateY(50px)] blur-[0px] origin-bottom';
      break;
    case 'skew-up':
      hiddenState = 'opacity-0 [transform:skewY(10deg)_translateY(60px)] blur-[4px]';
      break;
    case 'slide':
      hiddenState = 'opacity-0 translate-y-20 blur-[0px]'; // No blur for sharpness
      break;
    case 'fade':
      hiddenState = 'opacity-0 blur-[8px]';
      break;
      
    // --- NEW 3D CINEMATIC VARIANTS (AGGRESSIVE) ---
    
    case 'hologram':
      // Fast snap-in scale
      hiddenState = 'opacity-0 [transform:perspective(1000px)_scale3d(0.5,0.5,0.5)_translateZ(-200px)_rotateX(20deg)] blur-[10px] grayscale';
      break;

    case 'matrix-zoom':
      // Very deep Z push for "flying in" feeling
      hiddenState = 'opacity-0 [transform:perspective(1000px)_translateZ(-1200px)] blur-[4px]';
      break;

    case 'book-open':
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateY(90deg)] origin-left blur-[5px]';
      break;

    case 'deck-shuffle':
      // More rotation for a "dealing cards" snap
      hiddenState = 'opacity-0 [transform:perspective(1000px)_translateY(150%)_rotateZ(-30deg)_translateZ(-300px)] blur-[2px]';
      break;

    case 'turbine':
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateZ(90deg)_scale(0.2)_translateZ(-500px)] blur-[5px]';
      break;

    case 'slit-scan':
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateX(90deg)_scaleY(0)] blur-[0px] origin-center';
      break;

    case '3d':
    default:
      // Snappier 3D rise
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateX(30deg)_translateY(100px)_scale(0.85)_translateZ(-100px)] blur-[0px]';
      break;
  }

  return (
    <div
      ref={ref}
      className={`transform-gpu ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;