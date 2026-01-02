import React, { useState, useEffect, useRef } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>(['Welcome to Portfolio v2.0.0', 'Type "help" for available commands.']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands: { [key: string]: () => string | void } = {
    help: () => 'Available commands: about, skills, projects, contact, admin, clear, date, whoami, exit',
    about: () => 'I am Bhupesh Raj Bhatt, a Creative Developer & Designer from Nepal.',
    skills: () => 'React, Next.js, TypeScript, Tailwind, Node.js, Firebase, UI/UX Design.',
    projects: () => 'Navigating to projects section...',
    contact: () => 'Email: hello@bbhatt.com.np | Phone: +977 9761184935',
    admin: () => {
       window.history.pushState(null, "", "/admin");
       onClose();
       return 'Accessing Admin Panel...';
    },
    clear: () => { setHistory([]); return ''; },
    date: () => new Date().toString(),
    whoami: () => 'visitor@bbhatt-portfolio',
    exit: () => { onClose(); return 'Closing terminal...'; },
    ls: () => 'home  about  services  work  contact  cv.pdf',
    sudo: () => 'Permission denied: You are not Bhupesh.',
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      const args = cmd.split(' ');
      
      let response = '';

      if (cmd === '') {
        response = '';
      } else if (commands[args[0]]) {
         // Special handling for navigation
         if (args[0] === 'projects') {
            document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
            onClose();
         }
         const result = commands[args[0]]();
         if (typeof result === 'string') response = result;
      } else {
        response = `Command not found: ${cmd}. Type "help" for list.`;
      }

      if (cmd !== 'clear') {
         setHistory(prev => [...prev, `guest@bbhatt:~$ ${input}`, response].filter(Boolean));
      }
      
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 transition-all duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-3xl h-[550px] relative rounded-xl overflow-hidden flex flex-col font-mono text-sm transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out] shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{
            background: 'rgba(28, 28, 30, 0.75)',
            backdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px rgba(0,0,0,0.5)'
        }}
      >
        {/* Liquid Glass Reflection/Sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-0 mix-blend-overlay"></div>

        {/* macOS Title Bar */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl px-4 py-3.5 flex items-center justify-between border-b border-white/5 select-none draggable">
          <div className="flex gap-2 group">
            <button 
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-[#E0443E] shadow-sm flex items-center justify-center transition-all"
            >
                <i className="fas fa-times text-[6px] text-black/60 opacity-0 group-hover:opacity-100"></i>
            </button>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
          </div>
          
          <div className="flex items-center gap-2 opacity-60 absolute left-1/2 -translate-x-1/2">
             <i className="fas fa-terminal text-xs text-gray-400"></i>
             <span className="text-xs font-medium text-gray-300 tracking-wide">guest — -zsh</span>
          </div>
          
          <div className="w-10"></div>
        </div>

        {/* Terminal Body */}
        <div 
            className="relative z-10 flex-1 p-6 overflow-y-auto text-slate-200 space-y-2 custom-scrollbar selection:bg-white/20" 
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {history.map((line, i) => (
            <div key={i} className="break-words leading-relaxed">
               {line.startsWith('guest@') ? (
                   <div className="flex gap-2">
                       <span className="text-green-400 font-bold shrink-0">➜</span>
                       <span className="text-cyan-400 font-bold shrink-0">~</span>
                       <span>{line.split('$ ')[1]}</span>
                   </div>
               ) : (
                   <span className="text-slate-300 opacity-90 pl-5 block">{line}</span>
               )}
            </div>
          ))}
          
          <div className="flex items-center gap-2 pt-2">
            <span className="text-green-400 font-bold">➜</span>
            <span className="text-cyan-400 font-bold">~</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-white font-normal ml-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          {/* Custom Block Cursor */}
          <div className="pl-5 -mt-6 pointer-events-none">
             <span className="invisible">{input}</span>
             <span className="inline-block w-2.5 h-5 bg-gray-400/80 align-middle animate-pulse ml-0.5"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;