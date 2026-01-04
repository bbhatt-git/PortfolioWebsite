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
  duration = 1200, // Slower default for cinematic feel
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
        rootMargin: "0px 0px -100px 0px" // Trigger slightly later for drama
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnMount, threshold]);

  const style: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    willChange: 'transform, opacity, filter',
    transformStyle: 'preserve-3d', // CRITICAL for 3D
  };

  // Base state: usually hidden
  let hiddenState = '';
  // Target state: usually visible/reset
  let visibleState = 'opacity-100 [transform:translate3d(0,0,0)_rotateX(0)_rotateY(0)_scale(1)] blur-0 filter-none';

  switch (variant) {
    // --- LEGACY VARIANTS ---
    case 'rotate-left':
      hiddenState = 'opacity-0 [transform:perspective(1500px)_rotateY(-45deg)_translateX(-50px)_translateZ(-200px)] blur-[4px] origin-left';
      break;
    case 'rotate-right':
      hiddenState = 'opacity-0 [transform:perspective(1500px)_rotateY(45deg)_translateX(50px)_translateZ(-200px)] blur-[4px] origin-right';
      break;
    case 'zoom-in':
      hiddenState = 'opacity-0 [transform:scale(0.85)_translateY(30px)] blur-[2px]';
      break;
    case 'flip-up':
      hiddenState = 'opacity-0 [transform:perspective(1500px)_rotateX(80deg)_translateY(50px)_translateZ(-100px)] blur-[4px] origin-bottom';
      break;
    case 'skew-up':
      hiddenState = 'opacity-0 [transform:skewY(5deg)_translateY(40px)] blur-[4px]';
      break;
    case 'slide':
      hiddenState = 'opacity-0 translate-y-12 blur-[4px]';
      break;
    case 'fade':
      hiddenState = 'opacity-0 blur-[4px]';
      break;
      
    // --- NEW 3D CINEMATIC VARIANTS ---
    
    case 'hologram':
      // Looks like a sci-fi hologram materializing
      hiddenState = 'opacity-0 [transform:perspective(1000px)_scale3d(0.8,0.8,0.8)_translateZ(-100px)_rotateX(20deg)] blur-[10px] grayscale';
      visibleState = 'opacity-100 [transform:perspective(1000px)_scale3d(1,1,1)_translateZ(0)_rotateX(0)] blur-0 grayscale-0';
      break;

    case 'matrix-zoom':
      // Flies in from VERY deep Z-space
      hiddenState = 'opacity-0 [transform:perspective(2000px)_translateZ(-800px)] blur-[12px]';
      visibleState = 'opacity-100 [transform:perspective(2000px)_translateZ(0)] blur-0';
      break;

    case 'book-open':
      // Unfolds from the center Y-axis
      hiddenState = 'opacity-0 [transform:perspective(2000px)_rotateY(90deg)] origin-left blur-[5px]';
      visibleState = 'opacity-100 [transform:perspective(2000px)_rotateY(0deg)] origin-left blur-0';
      break;

    case 'deck-shuffle':
      // Slides up and rotates slightly like cards being dealt
      hiddenState = 'opacity-0 [transform:perspective(1200px)_translateY(100%)_rotateZ(-15deg)_translateZ(-200px)] blur-[5px]';
      visibleState = 'opacity-100 [transform:perspective(1200px)_translateY(0)_rotateZ(0)_translateZ(0)] blur-0';
      break;

    case 'turbine':
      // Rotates in from a spin
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateZ(45deg)_scale(0.5)_translateZ(-500px)] blur-[10px]';
      visibleState = 'opacity-100 [transform:perspective(1000px)_rotateZ(0)_scale(1)_translateZ(0)] blur-0';
      break;

    case 'slit-scan':
      // Expands horizontally with a 3D twist
      hiddenState = 'opacity-0 [transform:perspective(1500px)_rotateX(90deg)_scaleY(0)] blur-[8px] origin-top';
      visibleState = 'opacity-100 [transform:perspective(1500px)_rotateX(0deg)_scaleY(1)] blur-0 origin-top';
      break;

    case '3d':
    default:
      // Standard cinematic rise with tilt
      hiddenState = 'opacity-0 [transform:perspective(1500px)_rotateX(45deg)_translateY(60px)_scale(0.9)_translateZ(-100px)] blur-[6px]';
      visibleState = 'opacity-100 [transform:perspective(1500px)_rotateX(0deg)_translateY(0)_scale(1)_translateZ(0)] blur-0';
      break;
  }

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;