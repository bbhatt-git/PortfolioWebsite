import React, { useEffect, useState, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isIframeHover, setIsIframeHover] = useState(false);

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // Move dot instantly
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      
      // Move ring with lag (using CSS transition defined in class)
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Check for pointer targets
      const target = e.target as HTMLElement;
      
      // Check if hovering iframe
      if (target.tagName.toLowerCase() === 'iframe') {
        setIsIframeHover(true);
      } else {
        setIsIframeHover(false);
      }

      const isClickable = 
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.tagName.toLowerCase() === 'select' ||
        target.tagName.toLowerCase() === 'label' ||
        target.closest('a') !== null || 
        target.closest('button') !== null ||
        target.closest('[role="button"]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
        
      setIsPointer(!!isClickable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible || isIframeHover) return null;

  return (
    <>
      {/* Main Cursor Dot */}
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference bg-white transition-all duration-100 ease-out ${
          isClicking ? 'w-2 h-2' : 'w-2.5 h-2.5'
        }`}
      />
      
      {/* Trailing Ring */}
      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference border border-white transition-all duration-300 ease-out ${
          isPointer ? 'w-12 h-12 opacity-80 border-2' : 'w-6 h-6 opacity-50'
        } ${isClicking ? 'scale-75' : 'scale-100'}`}
      />
    </>
  );
};

export default CustomCursor;