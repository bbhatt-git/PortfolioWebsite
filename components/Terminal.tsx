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
      // Focus with a slight delay to ensure render is complete
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 px-4" onClick={onClose}>
      <div 
        className="w-full max-w-3xl h-[70vh] md:h-[600px] relative flex flex-col font-mono text-sm transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out] border border-blue-500/30 overflow-hidden bg-[#0a0a0a]/95 shadow-[0_0_50px_rgba(0,123,255,0.15)] rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] bg-repeat opacity-50"></div>
        
        {/* HUD Header */}
        <div className="relative z-30 bg-[#121212] px-4 py-3 flex items-center justify-between border-b border-blue-500/20 select-none">
          <div className="flex items-center gap-3">
             <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
             </div>
             <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
             <div className="flex items-center gap-2">
                 <i className="fas fa-terminal text-blue-400 text-xs"></i>
                 <span className="text-xs font-bold text-gray-300 tracking-wider">TERMINAL</span>
             </div>
          </div>
          
          <div className="hidden md:flex gap-4 text-[10px] text-blue-400/60 font-medium">
             <span>CPU: NORMAL</span>
             <span>MEM: 64TB</span>
          </div>

          <button 
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors"
            >
                <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Terminal Body */}
        <div 
            className="relative z-30 flex-1 p-4 md:p-6 overflow-y-auto text-blue-100 custom-scrollbar" 
            ref={scrollRef}
            onClick={handleContainerClick}
            style={{ 
                fontFamily: '"JetBrains Mono", monospace',
                textShadow: '0 0 5px rgba(0, 123, 255, 0.3)'
            }}
        >
          {history.map((line, i) => (
            <div key={i} className="mb-2 break-words leading-relaxed text-xs md:text-sm">
               {line.startsWith('root@') ? (
                   <div className="flex flex-wrap gap-x-2">
                       <span className="text-pink-500 font-bold">root@portfolio</span>
                       <span className="text-gray-400 font-bold">:</span>
                       <span className="text-blue-400 font-bold">~</span>
                       <span className="text-blue-400 font-bold">$</span>
                       <span className="text-white">{line.split('$ ')[1]}</span>
                   </div>
               ) : (
                   <span className={`block whitespace-pre-wrap ${line.startsWith('ERROR') ? 'text-red-400' : 'text-blue-100/90'}`}>{line}</span>
               )}
            </div>
          ))}
          
          {/* Input Line */}
          <div className="flex flex-wrap items-center gap-x-2 mt-2 text-xs md:text-sm relative">
             {/* Prompt */}
             <div className="flex gap-x-2 shrink-0">
                <span className="text-pink-500 font-bold">root@portfolio</span>
                <span className="text-gray-400 font-bold">:</span>
                <span className="text-blue-400 font-bold">~</span>
                <span className="text-blue-400 font-bold">$</span>
             </div>
            
            <div className="relative flex-1 min-w-[50px] flex items-center">
                {/* Visual Representation of Input */}
                <span className="text-white whitespace-pre-wrap break-all">{input}</span>
                
                {/* Blinking Block Cursor */}
                <span className="inline-block w-2 md:w-2.5 h-4 md:h-5 bg-blue-500/80 animate-pulse ml-[1px] align-middle shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>

                {/* Hidden Real Input - Captures typing but is invisible */}
                <input
                    ref={inputRef}
                    type="text"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    autoFocus
                />
            </div>
          </div>
        </div>
        
        {/* Footer HUD */}
        <div className="relative z-30 h-8 border-t border-blue-500/20 bg-[#121212] flex items-center justify-between px-4 text-[10px] text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
               <span>ONLINE</span>
            </div>
            <span>v2.4.0</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;