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
    { id: 'home', label: 'Go to Home', icon: 'fa-home', action: () => scrollToSection('#home'), category: 'Navigation' },
    { id: 'about', label: 'Go to About', icon: 'fa-user', action: () => scrollToSection('#about'), category: 'Navigation' },
    { id: 'projects', label: 'Go to Projects', icon: 'fa-code', action: () => scrollToSection('#work'), category: 'Navigation' },
    { id: 'services', label: 'Go to Services', icon: 'fa-briefcase', action: () => scrollToSection('#services'), category: 'Navigation' },
    { id: 'contact', label: 'Go to Contact', icon: 'fa-envelope', action: () => scrollToSection('#contact'), category: 'Navigation' },
    { id: 'theme', label: 'Toggle Theme', icon: 'fa-adjust', action: () => { toggleTheme(); onClose(); }, category: 'System' },
    { id: 'email', label: 'Copy Email', icon: 'fa-copy', action: () => { navigator.clipboard.writeText('hello@bbhatt.com.np'); onClose(); alert('Email copied!'); }, category: 'Action' },
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
    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 50px -10px rgba(0,0,0,0.3)'
        }}
      >
        {/* Spotlight Input Area */}
        <div className="flex items-center px-6 py-5 border-b border-gray-200/50 dark:border-white/10">
          <i className="fas fa-search text-2xl text-gray-400 dark:text-gray-500 mr-4"></i>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-2xl text-gray-900 dark:text-white placeholder-gray-400 font-light"
            placeholder="Spotlight Search"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
        </div>
        
        {/* Results List */}
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          {filteredActions.length > 0 ? (
            <div className="p-2">
                {filteredActions.map((action, index) => (
                <button
                    key={action.id}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-4 transition-all duration-200 group ${
                    index === selectedIndex 
                        ? 'bg-[#007AFF] text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                    onClick={action.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-lg ${
                        index === selectedIndex ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                        <i className={`fas ${action.icon}`}></i>
                    </div>
                    <div className="flex-1">
                        <span className="font-medium text-lg block">{action.label}</span>
                        <span className={`text-xs ${index === selectedIndex ? 'text-blue-100' : 'text-gray-400'}`}>{action.category}</span>
                    </div>
                    {index === selectedIndex && <i className="fas fa-arrow-turn-down -rotate-90 text-sm opacity-70"></i>}
                </button>
                ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No results found.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-200/50 dark:border-white/5 flex justify-between items-center text-xs text-gray-400 font-medium">
           <div className="flex gap-4">
             <span className="flex items-center gap-1"><kbd className="font-sans bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">↑↓</kbd> Navigate</span>
             <span className="flex items-center gap-1"><kbd className="font-sans bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">↵</kbd> Select</span>
           </div>
           <span className="flex items-center gap-1"><kbd className="font-sans bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;