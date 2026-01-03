import React, { useRef, useState } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'icon' | 'glass-primary' | 'glass-secondary';
  className?: string;
  href?: string; // If href is present, render as anchor
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  href,
  ...props 
}) => {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsHovered(true);
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Magnetic snap strength - stronger pull than before
    const pull = variant.includes('glass') ? 0.35 : 0.25;
    setPosition({ x: x * pull, y: y * pull });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const baseClasses = "relative inline-flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer select-none";
  
  const variantClasses = {
    primary: "px-8 py-3 rounded-full font-semibold bg-white/30 text-slate-600 shadow-lg hover:bg-white/60 hover:shadow-blue-600/40 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:bg-slate-800/60",
    secondary: "px-8 py-3 rounded-full font-semibold border-2 border-slate-400 text-slate-800 hover:bg-slate-400 hover:text-white dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-500 dark:hover:text-slate-900",
    icon: "w-10 h-10 rounded-full glass flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-sky-400 dark:hover:text-slate-900",
    
    // Enhanced Glassmorphism Designs
    "glass-primary": "px-8 py-4 rounded-full font-bold text-white bg-blue-600/70 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-blue-600/80 ring-1 ring-white/20",
    "glass-secondary": "px-8 py-4 rounded-full font-bold text-black dark:text-white bg-white/10 backdrop-blur-2xl border border-white/10 hover:bg-white/20 hover:border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] ring-1 ring-white/10"
  };

  const style = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isHovered ? 1.05 : 1})`,
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={combinedClasses}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
      >
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={combinedClasses}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default MagneticButton;