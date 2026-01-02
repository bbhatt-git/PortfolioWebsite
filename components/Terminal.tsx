import React, { useState, useEffect, useRef } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>(['> SYSTEM_READY', '> WELCOME_USER_V2.0']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commands: { [key: string]: () => string | void } = {
    help: () => 'Available commands: about, skills, projects, contact, clear, date, whoami, exit',
    about: () => 'Bhupesh Raj Bhatt | Creative Developer & Designer based in Nepal. Building digital experiences that matter.',
    skills: () => 'STACK: React, Next.js, TypeScript, Tailwind, Node.js, Firebase, UI/UX Design.',
    projects: () => 'Initiating warp drive to Projects Section...',
    contact: () => 'Transmission: hello@bbhatt.com.np | Signal: +977 9761184935',
    admin: () => {
       // Hidden Admin Command
       window.location.hash = "#/admin";
       onClose();
       return 'AUTHENTICATING ADMIN PROTOCOL...';
    },
    clear: () => { setHistory([]); return ''; },
    date: () => new Date().toISOString(),
    whoami: () => 'USER: Bhupesh Raj Bhatt\nROLE: Owner / Admin / Developer\nSTATUS: Online',
    exit: () => { onClose(); return 'TERMINATING SESSION...'; },
    ls: () => 'ACCESS DENIED: File system encrypted.',
    sudo: () => 'NICE_TRY. PERMISSION_DENIED.',
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
            setTimeout(onClose, 800);
         }
         const result = commands[args[0]]();
         if (typeof result === 'string') response = result;
      } else {
        response = `ERROR: Command '${cmd}' not recognized. Type 'help'.`;
      }

      if (cmd !== 'clear') {
         setHistory(prev => [...prev, `root@portfolio:~$ ${input}`, response].filter(Boolean));
      }
      
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300" onClick={onClose}>
      <div 
        className="w-[95%] md:w-full md:max-w-3xl h-[60vh] md:h-[600px] relative flex flex-col font-mono text-sm transform transition-all scale-100 animate-[scaleIn_0.1s_ease-out] border border-blue-500/30 overflow-hidden bg-black/90 shadow-[0_0_50px_rgba(0,123,255,0.2)]"
        onClick={e => e.stopPropagation()}
      >
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat"></div>
        <div className="absolute inset-0 pointer-events-none z-10 bg-blue-500/5 animate-pulse"></div>

        {/* HUD Header */}
        <div className="relative z-30 bg-blue-900/20 backdrop-blur-xl px-4 py-2 flex items-center justify-between border-b border-blue-500/30">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#007AFF]"></div>
             <span className="text-xs font-bold text-blue-400 tracking-[0.2em]">TERMINAL_V2</span>
          </div>
          
          <div className="flex gap-4 text-[10px] text-blue-300/60 font-medium">
             <span>MEM: 64TB</span>
             <span>CPU: OPTIMIZED</span>
             <span>NET: SECURE</span>
          </div>

          <button 
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-white transition-colors"
            >
                <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Terminal Body */}
        <div 
            className="relative z-30 flex-1 p-6 overflow-y-auto text-blue-100 space-y-3 custom-scrollbar" 
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            style={{ 
                fontFamily: '"JetBrains Mono", monospace',
                textShadow: '0 0 5px rgba(100, 200, 255, 0.5)'
            }}
        >
          {history.map((line, i) => (
            <div key={i} className="break-words leading-relaxed text-sm">
               {line.startsWith('root@') ? (
                   <div className="flex gap-2 flex-wrap">
                       <span className="text-pink-500 font-bold shrink-0">root@portfolio</span>
                       <span className="text-gray-400 font-bold shrink-0">:</span>
                       <span className="text-blue-400 font-bold shrink-0">~</span>
                       <span className="text-blue-400 font-bold shrink-0">$</span>
                       <span className="text-white">{line.split('$ ')[1]}</span>
                   </div>
               ) : (
                   <span className={`block whitespace-pre-wrap pl-4 border-l-2 ${line.startsWith('ERROR') ? 'border-red-500 text-red-300' : 'border-blue-500/50 text-blue-200'}`}>{line}</span>
               )}
            </div>
          ))}
          
          <div className="flex items-center gap-2 pt-4">
            <span className="text-pink-500 font-bold">root@portfolio</span>
            <span className="text-gray-400 font-bold">:</span>
            <span className="text-blue-400 font-bold">~</span>
            <span className="text-blue-400 font-bold">$</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-white font-bold ml-1 min-w-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              autoFocus
              autoComplete="off"
              spellCheck="false"
              autoCapitalize="none"
              style={{ textShadow: 'none' }}
            />
          </div>
          {/* Retro Block Cursor */}
          <div className="pl-[165px] -mt-6 pointer-events-none hidden md:block">
             <span className="invisible">{input}</span>
             <span className="inline-block w-2.5 h-5 bg-blue-500 align-middle animate-pulse ml-0.5 shadow-[0_0_8px_#007AFF]"></span>
          </div>
        </div>
        
        {/* Footer HUD */}
        <div className="relative z-30 h-6 border-t border-blue-500/30 bg-blue-900/10 flex items-center justify-between px-4 text-[10px] text-blue-400/50 uppercase tracking-wider">
            <span>Lat: 27.7172° N</span>
            <span>Sys_Op: ACTIVE</span>
            <span>Lng: 85.3240° E</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;