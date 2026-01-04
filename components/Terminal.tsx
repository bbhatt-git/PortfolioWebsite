import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import { SERVICES, TECH_STACK, STATS } from '../constants';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
    role: 'user' | 'model' | 'system';
    text: string;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<Message[]>([
      { role: 'system', text: 'INITIALIZING AI KERNEL...' },
      { role: 'system', text: 'CONNECTING TO NEURAL NET...' },
      { role: 'model', text: 'Greetings. I am the AI assistant for Bhupesh. I have access to his entire portfolio, skills, and project database. Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Ref to hold the chat instance
  const chatSession = useRef<Chat | null>(null);
  // Ref to hold project data for context
  const projectsRef = useRef<Project[]>([]);

  // 1. Fetch Data & Initialize Gemini
  useEffect(() => {
    const initAI = async () => {
        try {
            // Fetch Projects for Context
            const q = query(collection(db, "projects"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const fetchedProjects: Project[] = [];
            querySnapshot.forEach((doc) => {
                fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
            });
            projectsRef.current = fetchedProjects;

            // Build System Prompt
            const projectDescriptions = fetchedProjects.map(p => 
                `- ${p.title}: ${p.desc} (Stack: ${p.stack})`
            ).join('\n');

            const serviceDescriptions = SERVICES.map(s => `- ${s.title}: ${s.desc}`).join('\n');
            const statsDescription = STATS.map(s => `${s.label}: ${s.value}`).join(', ');

            const systemInstruction = `
                You are "Bhupesh AI", an advanced virtual assistant living in the terminal of Bhupesh Raj Bhatt's portfolio website.
                
                **Identity:**
                - Name: Bhupesh AI (v2.5)
                - Personality: Professional, witty, slightly "cyberpunk/hacker" aesthetic, but very helpful.
                - Creator: Bhupesh Raj Bhatt
                
                **About Bhupesh:**
                - Role: Senior Full Stack Developer & UI/UX Designer based in Mahendranagar, Nepal.
                - Experience: 2+ Years.
                - Key Skills: ${TECH_STACK.join(', ')}.
                - Stats: ${statsDescription}
                - Contact: hello@bbhatt.com.np, +977 9761184935.
                
                **Projects:**
                ${projectDescriptions}
                
                **Services:**
                ${serviceDescriptions}
                
                **Rules:**
                1. Keep answers concise and terminal-friendly (avoid long paragraphs).
                2. Use technical jargon where appropriate but stay understandable.
                3. If asked to navigate, tell the user you are executing the command (e.g., "Navigating to Projects...").
                4. If asked about something not in your database, politely say you lack that data.
                5. Do NOT hallucinate personal details not provided here.
                6. When listing things, use bullet points or simple lists.
            `;

            // Initialize Gemini
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatSession.current = ai.chats.create({
                model: 'gemini-1.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                },
            });

        } catch (error) {
            console.error("Failed to init AI:", error);
            setHistory(prev => [...prev, { role: 'system', text: 'ERROR: NEURAL LINK FAILED. OFFLINE MODE ACTIVE.' }]);
        }
    };

    if (isOpen && !chatSession.current) {
        initAI();
    }
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isThinking]);

  // Local commands
  const handleLocalCommand = (cmd: string): boolean => {
      const lowerCmd = cmd.toLowerCase().trim();
      
      if (lowerCmd === 'clear') {
          setHistory([]);
          return true;
      }
      if (lowerCmd === 'exit') {
          onClose();
          return true;
      }
      if (lowerCmd === 'help') {
           setHistory(prev => [...prev, { role: 'user', text: cmd }]);
           setHistory(prev => [...prev, { role: 'model', text: 'Available Local Commands:\n- clear: Clear terminal\n- exit: Close terminal\n- admin: Access admin panel\n\nFor everything else, just ask me naturally! E.g., "Who is Bhupesh?", "Show me his projects".' }]);
           return true;
      }
      if (lowerCmd === 'admin') {
          window.history.pushState({}, '', '/admin');
          window.dispatchEvent(new Event('pushstate'));
          onClose();
          return true;
      }
      // UI Navigation triggers (Simulated)
      if (lowerCmd.includes('project') || lowerCmd.includes('work')) {
          // We let the AI handle the text response, but we trigger scroll
          setTimeout(() => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' }), 1000);
      }
      if (lowerCmd.includes('contact') || lowerCmd.includes('email')) {
           setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 1000);
      }

      return false;
  };

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const userMsg = input;
      setInput('');
      
      // 1. Handle Local Commands first
      if (handleLocalCommand(userMsg)) return;

      // 2. Add User Message to History
      setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsThinking(true);

      try {
          if (!chatSession.current) {
              throw new Error("AI Offline");
          }

          // 3. Stream Response from Gemini
          const resultStream = await chatSession.current.sendMessageStream({ message: userMsg });
          
          let fullResponse = "";
          // Add a placeholder message for the model
          setHistory(prev => [...prev, { role: 'model', text: '' }]);

          for await (const chunk of resultStream) {
              const c = chunk as GenerateContentResponse;
              const textChunk = c.text;
              fullResponse += textChunk;
              
              // Update the last message in history with the growing text
              setHistory(prev => {
                  const newHistory = [...prev];
                  const lastMsg = newHistory[newHistory.length - 1];
                  if (lastMsg.role === 'model') {
                      lastMsg.text = fullResponse;
                  }
                  return newHistory;
              });
          }

      } catch (error) {
          console.error(error);
          setHistory(prev => [...prev, { role: 'system', text: 'ERROR: COMMUNICATION INTERRUPTED.' }]);
      } finally {
          setIsThinking(false);
      }
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
        className="w-full max-w-3xl h-[85vh] md:h-[600px] relative flex flex-col transform transition-all scale-100 animate-[scaleIn_0.2s_ease-out] overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10"
        onClick={e => e.stopPropagation()}
        style={{
            background: 'rgba(15, 15, 20, 0.95)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-30 opacity-10" 
             style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}>
        </div>

        {/* Title Bar */}
        <div className="relative z-20 h-10 flex items-center px-4 bg-[#1a1a1a] border-b border-white/10 select-none shrink-0 justify-between">
           <div className="flex gap-2 group">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-110"></button>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
           </div>
           <div className="text-xs font-mono text-gray-400 opacity-80 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               bhupesh_ai — v2.5
           </div>
           <div className="w-10"></div>
        </div>

        {/* Terminal Body */}
        <div 
            className="relative z-10 flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-[#0C0C0C]"
            ref={scrollRef}
            onClick={handleContainerClick}
        >
            <div 
                className="font-mono text-[14px] md:text-[15px] leading-relaxed"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
                {history.map((msg, i) => (
                    <div key={i} className="mb-4 break-words whitespace-pre-wrap animate-fade-in">
                       {msg.role === 'user' ? (
                           <div className="text-white">
                               <span className="text-[#00C7FC] mr-2">➜</span>
                               <span className="font-bold text-[#E0E0E0]">{msg.text}</span>
                           </div>
                       ) : msg.role === 'system' ? (
                           <div className="text-yellow-500 text-xs uppercase tracking-widest opacity-80">
                               [{msg.text}]
                           </div>
                       ) : (
                           <div className="text-[#4AF626] ml-4 border-l-2 border-[#4AF626]/30 pl-3">
                               {msg.text}
                               {/* Cursor at end of last model message if still thinking */}
                               {i === history.length - 1 && isThinking && <span className="inline-block w-2 h-4 bg-[#4AF626] ml-1 animate-pulse align-middle"></span>}
                           </div>
                       )}
                    </div>
                ))}
                
                {/* Active Input Line */}
                <div className="flex flex-row items-center mt-6">
                    <span className="text-[#00C7FC] mr-2 text-lg">➜</span>
                    <span className="text-[#ff5f57] font-bold mr-2">~</span>
                    
                    <div className="relative flex-1">
                         <input 
                            ref={inputRef}
                            type="text"
                            className="w-full bg-transparent border-none outline-none text-white font-mono text-[16px] placeholder-gray-700"
                            placeholder="Ask me about my projects, skills, or experience..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleSubmit}
                            autoComplete="off"
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