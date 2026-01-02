import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number; // delay in ms
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { 
        threshold: 0.15, // Slightly higher threshold prevents premature triggering
        rootMargin: "0px 0px -50px 0px" // Only trigger when slightly into view
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

  return (
    <div
      ref={ref}
      // Using 'ease-expo' (defined in tailwind config) for that "Apple" snappy-yet-smooth feel
      className={`transition-all duration-1000 ease-expo transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-16' // Increased travel distance for more drama
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Reveal;