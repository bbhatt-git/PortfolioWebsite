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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    
    // Pull factor - increased for better feel
    const pull = variant === 'icon' ? 0.4 : 0.3;
    setPosition({ x: x * pull, y: y * pull });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseClasses = "relative inline-flex items-center justify-center transition-all duration-300 ease-out cursor-pointer";
  
  const variantClasses = {
    primary: "px-8 py-3 rounded-full font-semibold bg-white/30 text-slate-600 shadow-lg hover:bg-white/60 hover:shadow-blue-600/40 hover:-translate-y-1 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:bg-slate-800/60",
    secondary: "px-8 py-3 rounded-full font-semibold border-2 border-slate-400 text-slate-800 hover:bg-slate-400 hover:text-white dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-500 dark:hover:text-slate-900 ml-4",
    icon: "w-10 h-10 rounded-full glass flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-sky-400 dark:hover:text-slate-900",
    
    // New Glassmorphism Variants
    "glass-primary": "px-8 py-4 rounded-full font-bold text-white bg-blue-600/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 hover:scale-105 active:scale-95",
    "glass-secondary": "px-8 py-4 rounded-full font-bold text-black dark:text-white bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/40 shadow-lg transition-all hover:scale-105 active:scale-95"
  };

  const style = {
    transform: `translate(${position.x}px, ${position.y}px)`,
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
        {children}
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
      {children}
    </button>
  );
};

export default MagneticButton;