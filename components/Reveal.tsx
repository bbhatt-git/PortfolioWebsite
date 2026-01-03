import React, { useEffect, useRef, useState } from 'react';

type RevealVariant = 
  | 'fade' 
  | 'slide' 
  | '3d' 
  | 'rotate-left' 
  | 'rotate-right'
  | 'zoom-in' 
  | 'flip-up'
  | 'skew-up';

interface RevealProps {
  children: React.ReactNode;
  delay?: number; // delay in ms
  className?: string;
  variant?: RevealVariant;
  duration?: number;
  triggerOnMount?: boolean;
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  delay = 0, 
  className = '', 
  variant = '3d',
  duration = 1000,
  triggerOnMount = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (triggerOnMount) {
      // Force visibility on mount with a tiny delay to ensure transition play
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
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnMount]);

  const style: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    willChange: 'transform, opacity, filter',
  };

  let hiddenState = '';
  // Default visible state cleans up all transforms
  let visibleState = 'opacity-100 [transform:translate3d(0,0,0)_rotate(0)_scale(1)] blur-0';

  switch (variant) {
    case 'rotate-left':
      // Swings in from the left like a door
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateY(-30deg)_translateX(-30px)] blur-[4px] origin-left';
      break;
    case 'rotate-right':
      // Swings in from the right
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateY(30deg)_translateX(30px)] blur-[4px] origin-right';
      break;
    case 'zoom-in':
      // Scales up from the background
      hiddenState = 'opacity-0 [transform:scale(0.85)_translateY(30px)] blur-[2px]';
      break;
    case 'flip-up':
      // Flips up from bottom (card deck effect)
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateX(60deg)_translateY(50px)] blur-[4px] origin-bottom';
      break;
    case 'skew-up':
      // Skews in from bottom (dynamic text effect)
      hiddenState = 'opacity-0 [transform:skewY(5deg)_translateY(40px)] blur-[4px]';
      break;
    case 'slide':
      hiddenState = 'opacity-0 translate-y-12 blur-[4px]';
      break;
    case 'fade':
      hiddenState = 'opacity-0 blur-[4px]';
      break;
    case '3d':
    default:
      // Cinematic rise with tilt
      hiddenState = 'opacity-0 [transform:perspective(1000px)_rotateX(45deg)_translateY(60px)_scale(0.9)] blur-[6px]';
      visibleState = 'opacity-100 [transform:perspective(1000px)_rotateX(0deg)_translateY(0)_scale(1)] blur-0';
      break;
  }

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all ease-out-expo ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;