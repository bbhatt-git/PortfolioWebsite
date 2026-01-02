import React, { useState, useEffect, useRef } from 'react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  toggleTheme: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, toggleTheme }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { id: 'home', label: 'Go to Home', icon: 'fa-home', action: () => scrollToSection('#home') },
    { id: 'about', label: 'Go to About', icon: 'fa-user', action: () => scrollToSection('#about') },
    { id: 'projects', label: 'Go to Projects', icon: 'fa-code', action: () => scrollToSection('#work') },
    { id: 'services', label: 'Go to Services', icon: 'fa-briefcase', action: () => scrollToSection('#services') },
    { id: 'contact', label: 'Go to Contact', icon: 'fa-envelope', action: () => scrollToSection('#contact') },
    { id: 'theme', label: 'Toggle Theme', icon: 'fa-adjust', action: () => { toggleTheme(); onClose(); } },
    { id: 'email', label: 'Copy Email', icon: 'fa-copy', action: () => { navigator.clipboard.writeText('hello@bbhatt.com.np'); onClose(); alert('Email copied!'); } },
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      window.history.pushState(null, "", id);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-[fadeUp_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <i className="fas fa-search text-slate-400 mr-3"></i>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ESC</span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredActions.length > 0 ? (
            filteredActions.map((action, index) => (
              <button
                key={action.id}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-sky-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={action.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <i className={`fas ${action.icon} w-5 text-center opacity-70`}></i>
                <span className="flex-1 font-medium">{action.label}</span>
                {index === selectedIndex && <i className="fas fa-arrow-turn-down -rotate-90 text-xs opacity-50"></i>}
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-500">
              No results found.
            </div>
          )}
        </div>
        
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
           <div className="flex gap-3">
             <span><b className="font-sans bg-slate-200 dark:bg-slate-700 px-1 rounded">↑↓</b> to navigate</span>
             <span><b className="font-sans bg-slate-200 dark:bg-slate-700 px-1 rounded">↵</b> to select</span>
           </div>
           <span>Spotlight Search</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;