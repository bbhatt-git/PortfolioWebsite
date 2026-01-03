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
       // Hidden Admin Command - Navigating to /admin path
       window.history.pushState({}, '', '/admin');
       window.dispatchEvent(new Event('pushstate'));
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
      // Small delay to ensure render
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
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
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md px-3 md:px-4 py-6 md:py-0 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl h-[85vh] md:h-[500px] relative flex flex-col transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out] overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10"
        onClick={e => e.stopPropagation()}
        style={{
            background: 'rgba(20, 20, 25, 0.85)',
            backdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        {/* Liquid Glass Reflection Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent z-10 opacity-50"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
        
        {/* Title Bar */}
        <div className="relative z-20 h-12 flex items-center px-4 bg-white/5 border-b border-white/5 select-none shrink-0 justify-between backdrop-blur-xl">
           <div className="flex gap-2 group p-2 -ml-2">
              <button 
                onClick={onClose} 
                className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:bg-[#FF5F57]/80 flex items-center justify-center text-[8px] text-black/50 transition-colors"
              >
                 <i className="fas fa-times opacity-0 group-hover:opacity-100"></i>
              </button>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
           </div>

           <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60 text-gray-300">
               <i className="fas fa-terminal text-[10px]"></i>
               <span className="text-xs font-medium tracking-wide font-sans">bhupesh — -zsh</span>
           </div>
        </div>

        {/* Terminal Body */}
        <div 
            className="relative z-10 flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar"
            ref={scrollRef}
            onClick={handleContainerClick}
        >
            <div 
                className="font-mono text-[14px] md:text-sm leading-relaxed text-[#D0D0D0]"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
                {history.map((line, i) => (
                    <div key={i} className="mb-2 break-words whitespace-pre-wrap">
                       {line.startsWith('root@') ? (
                           <div className="inline">
                               <span className="text-[#ff5f57] font-bold">root@portfolio</span>
                               <span className="text-gray-500 mx-1">:</span>
                               <span className="text-[#00C7FC] font-bold">~</span>
                               <span className="text-gray-500 mx-1">$</span>
                               <span className="text-gray-100">{line.split('$ ')[1]}</span>
                           </div>
                       ) : (
                           <span className={line.startsWith('ERROR') ? 'text-[#ff5f57]' : 'text-[#D0D0D0]'}>{line}</span>
                       )}
                    </div>
                ))}
                
                {/* Active Input Line - Flex Layout for Inline Cursor */}
                <div className="flex flex-row items-baseline flex-wrap">
                    <span className="text-[#ff5f57] font-bold shrink-0">root@portfolio</span>
                    <span className="text-gray-500 mx-1 shrink-0">:</span>
                    <span className="text-[#00C7FC] font-bold shrink-0">~</span>
                    <span className="text-gray-500 mx-1 shrink-0">$</span>
                    
                    <div className="relative flex-1 min-w-[20px] inline-block ml-2">
                         <span className="text-gray-100 whitespace-pre-wrap break-all">{input}</span>
                         <span className="inline-block w-2 h-4 bg-[#A8A8A8] ml-[1px] animate-[pulse_1s_steps(2,start)_infinite] align-middle translate-y-[2px]"></span>
                         <input 
                            ref={inputRef}
                            type="text"
                            className="absolute inset-0 opacity-0 cursor-default h-full w-full text-[16px]" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleCommand}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck="false"
                            autoFocus
                         />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;