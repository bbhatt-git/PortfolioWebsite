import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-24 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right backdrop-blur-md border ${
      type === 'success' 
        ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
        : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
    }`}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><i className="fas fa-times"></i></button>
    </div>
  );
};

export default Toast;