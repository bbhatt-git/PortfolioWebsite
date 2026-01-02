import React, { useState, useEffect, useRef } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>(['Welcome to BBhatt v1.0.0', 'Type "help" for available commands.']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands: { [key: string]: () => string | void } = {
    help: () => 'Available commands: about, skills, projects, contact, clear, date, whoami, exit',
    about: () => 'I am Bhupesh Raj Bhatt, a Creative Developer & Designer from Nepal.',
    skills: () => 'React, Next.js, TypeScript, Tailwind, Node.js, Firebase, UI/UX Design.',
    projects: () => 'Navigating to projects section...',
    contact: () => 'Email: hello@bbhatt.com.np | Phone: +977 9761184935',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 transition-all duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-2xl h-[500px] backdrop-blur-2xl bg-[#1c1c1e]/90 dark:bg-[#000000]/85 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm border border-white/10 ring-1 ring-black/50 transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 px-4 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex gap-2">
            <button className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#ff3b30] border border-transparent shadow-sm transition-colors group flex items-center justify-center" onClick={onClose}>
                <i className="fas fa-times text-[8px] text-black opacity-0 group-hover:opacity-50"></i>
            </button>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-transparent shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840] border border-transparent shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2 opacity-60">
             <i className="fas fa-folder text-xs"></i>
             <span className="text-xs font-medium text-gray-300">guest — -zsh</span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Terminal Body */}
        <div 
            className="flex-1 p-4 overflow-y-auto text-slate-300 space-y-1 custom-scrollbar selection:bg-white/20" 
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {history.map((line, i) => (
            <div key={i} className="break-words">
               {line.startsWith('guest@') ? (
                   <span><span className="text-green-400 font-bold">guest@bbhatt</span>:<span className="text-blue-400 font-bold">~</span>$ {line.split('$ ')[1]}</span>
               ) : (
                   <span className="text-slate-300 opacity-90">{line}</span>
               )}
            </div>
          ))}
          
          <div className="flex items-center">
            <span className="text-green-400 font-bold">guest@bbhatt</span>
            <span className="text-white font-bold">:</span>
            <span className="text-blue-400 font-bold">~</span>
            <span className="text-white font-bold mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-white font-normal"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
            {/* Blinking Cursor */}
            <span className="w-2 h-5 bg-gray-400 opacity-50 animate-pulse -ml-1"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;