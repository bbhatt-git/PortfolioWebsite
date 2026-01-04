import React, { useState, useEffect, useRef } from 'react';
import { TECH_STACK } from '../constants';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileSystem {
  [key: string]: string | FileSystem;
}

// Virtual File System Structure
const fileSystem: FileSystem = {
  'about.txt': "Name: Bhupesh Raj Bhatt\nRole: Senior Full Stack Developer\nLocation: Mahendranagar, Nepal\nExp: 2+ Years\n\nI build pixel-perfect, performant web architectures.",
  'contact.md': "Email: hello@bbhatt.com.np\nPhone: +977 9761184935\nGitHub: github.com/bbhatt-git\nLinkedIn: linkedin.com/in/bhattbhupesh",
  'skills.json': JSON.stringify(TECH_STACK, null, 2),
  'projects': {
    'portfolio.txt': "This website. Built with React, Vite, Tailwind, and Firebase.",
    'ecommerce.txt': "A full-stack e-commerce solution using Next.js and Stripe.",
    'saas_dashboard.txt': "Real-time analytics dashboard for fintech clients.",
    'readme.md': "To view a project, type 'cat [filename]'."
  }
};

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>(['Welcome to BhupeshOS v1.0.0', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>([]); // [] = root
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus and scroll
  useEffect(() => {
    if (isOpen) {
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

  // Helper to get current directory object
  const getCurrentDir = () => {
    let current: any = fileSystem;
    for (const segment of currentPath) {
      if (current[segment] && typeof current[segment] === 'object') {
        current = current[segment];
      } else {
        return null;
      }
    }
    return current;
  };

  const executeCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Echo command
    setHistory(prev => [...prev, `${getUserPrompt()} ${cmd}`]);

    if (!command) return;

    switch (command) {
      case 'help':
        setHistory(prev => [...prev, 
          'Available commands:',
          '  ls           List directory contents',
          '  cd [dir]     Change directory',
          '  cat [file]   Print file content',
          '  whoami       Display current user',
          '  date         Display system date',
          '  clear        Clear terminal screen',
          '  exit         Close terminal'
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'exit':
        onClose();
        break;

      case 'whoami':
        setHistory(prev => [...prev, 'guest']);
        break;

      case 'date':
        setHistory(prev => [...prev, new Date().toString()]);
        break;

      case 'ls': {
        const dir = getCurrentDir();
        if (dir) {
          const items = Object.keys(dir).map(key => {
            const isDir = typeof dir[key] === 'object';
            return isDir ? `${key}/` : key;
          });
          setHistory(prev => [...prev, items.join('  ')]);
        } else {
          setHistory(prev => [...prev, 'Error: Current directory not found']);
        }
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target) {
          setCurrentPath([]); // go root
        } else if (target === '..') {
          setCurrentPath(prev => prev.slice(0, -1));
        } else if (target === '/') {
          setCurrentPath([]);
        } else {
          const dir = getCurrentDir();
          if (dir && dir[target] && typeof dir[target] === 'object') {
            setCurrentPath(prev => [...prev, target]);
          } else {
            setHistory(prev => [...prev, `cd: ${target}: No such directory`]);
          }
        }
        break;
      }

      case 'cat': {
        const target = args[0];
        if (!target) {
          setHistory(prev => [...prev, 'usage: cat [file]']);
        } else {
          const dir = getCurrentDir();
          if (dir && dir[target]) {
             if (typeof dir[target] === 'string') {
               setHistory(prev => [...prev, dir[target] as string]);
             } else {
               setHistory(prev => [...prev, `cat: ${target}: Is a directory`]);
             }
          } else {
            setHistory(prev => [...prev, `cat: ${target}: No such file`]);
          }
        }
        break;
      }
      
      case 'sudo':
        setHistory(prev => [...prev, 'Permission denied: You are not an admin.']);
        break;

      default:
        setHistory(prev => [...prev, `command not found: ${command}`]);
    }
  };

  const getUserPrompt = () => {
    const pathStr = currentPath.length === 0 ? '~' : `~/${currentPath.join('/')}`;
    return `guest@bhupesh:${pathStr}$`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-3 md:px-4 py-6 md:py-0 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl h-[85vh] md:h-[600px] relative flex flex-col transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out] overflow-hidden rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-[#333] bg-[#0c0c0c]"
        onClick={e => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="relative z-20 h-8 flex items-center px-4 bg-[#1f1f1f] border-b border-[#333] select-none shrink-0 justify-between">
           <div className="flex gap-2">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-110"></button>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
           </div>
           <div className="text-xs font-mono text-gray-400">guest@bhupesh: ~</div>
           <div className="w-10"></div>
        </div>

        {/* Terminal Body */}
        <div 
            className="relative z-10 flex-1 p-4 overflow-y-auto custom-scrollbar"
            ref={scrollRef}
            onClick={handleContainerClick}
            style={{ backgroundColor: '#0C0C0C' }}
        >
            <div className="font-mono text-[14px] leading-6 text-[#cccccc]">
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">
                        {line.startsWith('guest@') ? (
                           <span>
                             <span className="text-green-500">guest@bhupesh</span>
                             <span className="text-white">:</span>
                             <span className="text-blue-500">
                                {line.split(':')[1].split('$')[0]}
                             </span>
                             <span className="text-white">$ </span>
                             <span>{line.split('$')[1]}</span>
                           </span>
                        ) : (
                          <span>{line}</span>
                        )}
                    </div>
                ))}
                
                {/* Active Input Line */}
                <div className="flex flex-row items-center mt-1">
                    <span className="text-green-500">guest@bhupesh</span>
                    <span className="text-white">:</span>
                    <span className="text-blue-500">
                        {currentPath.length === 0 ? '~' : `~/${currentPath.join('/')}`}
                    </span>
                    <span className="text-white mr-2">$</span>
                    
                    <div className="relative flex-1">
                         <input 
                            ref={inputRef}
                            type="text"
                            className="w-full bg-transparent border-none outline-none text-[#cccccc] font-mono text-[14px] p-0 m-0"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            autoFocus
                            spellCheck={false}
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