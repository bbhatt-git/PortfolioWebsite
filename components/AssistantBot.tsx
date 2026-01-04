import React, { useEffect, useRef, useState } from 'react';
import { useBot } from '../context/BotContext';

// --- MASSIVE VOCABULARY ARRAYS ---

const VERBS = [
  "Analyzing", "Scanning", "Parsing", "Computing", "Rendering", "Optimizing", "Debugging", "Refactoring", 
  "Indexing", "Fetching", "Caching", "Compiling", "Minifying", "Bundling", "Hydrating", "Vectorizing", 
  "Encrypting", "Decrypting", "Validating", "Sanitizing", "Serializing", "Virtualizing", "Observing", 
  "Tracking", "Monitoring", "Auditing", "Profiling", "Linting", "Transpiling", "Injecting", "Mounting",
  "Unmounting", "Updating", "Patching", "Diffing", "Reconciling", "Buffering", "Streaming", "Ping",
  "Tracing", "Logging", "Mapping", "Reducing", "Filtering", "Sorting", "Allocating", "Garbage Collecting"
];

const ADJECTIVES = [
  "asynchronous", "synchronous", "blocked", "non-blocking", "concurrent", "parallel", "distributed", 
  "redundant", "immutable", "mutable", "volatile", "persistent", "ephemeral", "stateful", "stateless", 
  "responsive", "adaptive", "fluid", "static", "dynamic", "relative", "absolute", "fixed", "sticky", 
  "flex", "grid", "hidden", "visible", "opaque", "transparent", "blurred", "pixelated", "vectorized", 
  "minified", "obfuscated", "secure", "insecure", "encrypted", "hashed", "cached", "stale", "fresh", 
  "dirty", "clean", "pure", "impure", "recursive", "iterative", "declarative", "imperative", "functional"
];

const NOUNS = [
  "DOM Tree", "Shadow DOM", "Virtual DOM", "Event Loop", "Call Stack", "Heap Memory", "Render Layer", 
  "Composite Layer", "Layout Engine", "CSSOM", "AST", "Bytecode", "Machine Code", "Binary Blob", 
  "JSON Payload", "XML Schema", "JWT Token", "Session Cookie", "Local Storage", "IndexedDB", "Cache API", 
  "Service Worker", "Web Worker", "Main Thread", "GPU Process", "Network Request", "HTTP Header", 
  "TCP Handshake", "TLS Cert", "DNS Record", "IP Address", "Mac Address", "Subnet Mask", "Gateway", 
  "Firewall", "Proxy", "Load Balancer", "CDN Edge", "Viewport", "Scroll Offset", "Mouse Coordinates", 
  "Touch Event", "Pointer Event", "Key Code", "Frame Rate", "Refresh Rate", "Pixel Ratio", "Aspect Ratio"
];

const TECH_JARGON = [
  "Quantum entanglement detected.", "Flux capacitor charging.", "Reticulating splines.", 
  "Reversing the polarity.", "Overclocking the neural net.", "Defragmenting the mainframe.", 
  "Bypassing the compressor.", "Routing through proxy chain.", "Establishing secure handshake.", 
  "Calculating pi to last digit.", "Solving P vs NP.", "Mining fictional crypto.", 
  "Downloading more RAM.", "Updating dependencies...", "Resolving merge conflicts.", 
  "Git push --force origin master.", "Sudo make me a sandwich.", "Console.log('Is this real?');", 
  "Checking robotic laws.", "Applying Turing test.", "Zero-knowledge proof verified.", 
  "Homomorphic encryption active.", "Simulating universe...", "Rendering 4D hypercube.", 
  "Detecting user aura.", "Measuring cognitive load.", "Optimizing dopamine hits."
];

const PREFIXES = [
  "Notice:", "Alert:", "System:", "Info:", "Debug:", "Log:", "Status:", "Metrics:", "Trace:", "Ping:", "Ack:", "Syn:"
];

const SUFFIXES = [
  " - optimized.", " - nominal.", " - critical.", " - stable.", " - efficient.", " - redundant.", 
  " - latency detected.", " - bandwidth high.", " - packet loss 0%.", " - cpu idle.", " - gpu active.", 
  " - memory safe.", " - thread locked.", " - async await.", " - promise resolved.", " - catch block."
];

// --- ADVANCED MESSAGE GENERATOR ---

class MessageEngine {
  private history: Set<string>;
  private maxHistory: number;

  constructor() {
    this.history = new Set();
    this.maxHistory = 1000; // Keep track of last 1000 messages to ensure strict uniqueness locally
  }

  private getRandom(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private generateCandidate(): string {
    const template = Math.floor(Math.random() * 6);

    switch (template) {
      case 0: // Verb + Noun
        return `${this.getRandom(VERBS)} ${this.getRandom(NOUNS)}...`;
      case 1: // Verb + Adjective + Noun
        return `${this.getRandom(VERBS)} ${this.getRandom(ADJECTIVES)} ${this.getRandom(NOUNS)}.`;
      case 2: // Adjective + Noun + Suffix
        return `${this.getRandom(ADJECTIVES)} ${this.getRandom(NOUNS)}${this.getRandom(SUFFIXES)}`;
      case 3: // Prefix + Noun + is + Adjective
        return `${this.getRandom(PREFIXES)} ${this.getRandom(NOUNS)} is ${this.getRandom(ADJECTIVES)}.`;
      case 4: // Tech Jargon (Rare)
        return this.getRandom(TECH_JARGON);
      case 5: // Complex Action
        return `Attempting to ${this.getRandom(VERBS).toLowerCase()} the ${this.getRandom(ADJECTIVES)} ${this.getRandom(NOUNS)}.`;
      default:
        return "System nominal.";
    }
  }

  public getUniqueMessage(): string {
    let candidate = this.generateCandidate();
    let attempts = 0;

    // Retry if message exists in history
    while (this.history.has(candidate) && attempts < 10) {
      candidate = this.generateCandidate();
      attempts++;
    }

    // Update History
    this.history.add(candidate);
    if (this.history.size > this.maxHistory) {
      const first = this.history.values().next().value;
      if (first) this.history.delete(first);
    }

    return candidate;
  }
}

const engine = new MessageEngine();

const AssistantBot: React.FC = () => {
  const { message, say } = useBot();
  const eyesRef = useRef<HTMLDivElement>(null);
  
  // Mobile / Capability Check
  const [shouldRender, setShouldRender] = useState(false);

  // State
  const [pos, setPos] = useState({ x: -100, y: -100 }); // Start off-screen
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left');
  
  // Message Animation State
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // Physics Refs
  const vel = useRef({ x: -0.8, y: -0.5 });
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastTime = useRef(0);
  const lastHoveredElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // STRICT CHECK: Only render on devices with fine pointers (mouse) and larger screens
    const checkCapability = () => {
       const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
       const isLargeScreen = window.innerWidth >= 1024;
       setShouldRender(hasFinePointer && isLargeScreen);
       
       if (hasFinePointer && isLargeScreen) {
          // Initialize position if valid
          setPos({ x: window.innerWidth - 120, y: window.innerHeight - 200 });
       }
    };
    
    checkCapability();
    window.addEventListener('resize', checkCapability);
    return () => window.removeEventListener('resize', checkCapability);
  }, []);

  // --- INTERACTION LOGIC ---
  const getInteractionMessage = (el: HTMLElement): string => {
    // Specific overrides based on attributes
    const customMsg = el.getAttribute('data-bot-msg');
    if (customMsg) {
       const parts = customMsg.split('|');
       return parts[Math.floor(Math.random() * parts.length)];
    }

    const href = (el.getAttribute('href') || '').toLowerCase();
    
    // Fallback to the massive combinatorial engine
    if (href.includes('github')) return `Analyzing repo: ${engine.getUniqueMessage()}`;
    if (href.includes('linkedin')) return `Networking protocol: ${engine.getUniqueMessage()}`;
    
    return engine.getUniqueMessage();
  };

  useEffect(() => {
    if (!shouldRender) return;

    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, input, textarea, img, [role="button"], [data-bot-msg]') as HTMLElement;

      if (interactiveEl) {
        if (lastHoveredElement.current !== interactiveEl) {
          lastHoveredElement.current = interactiveEl;
          const msg = getInteractionMessage(interactiveEl);
          say(msg, 4000);
        }
      } else {
        lastHoveredElement.current = null;
      }
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mouseover', handleGlobalMouseOver);
    window.addEventListener('mousemove', handleGlobalMouseOver);

    return () => {
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      window.removeEventListener('mousemove', handleGlobalMouseOver);
    };
  }, [say, shouldRender]);

  // Sync displayed message
  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      setIsBubbleVisible(true);
    } else {
      setIsBubbleVisible(false);
      const t = setTimeout(() => setDisplayedMessage(null), 300);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    vel.current = { x: 0, y: 0 };
    say("Manual override engaged.", 2000);
  };

  const handleWindowMouseUp = () => setIsDragging(false);

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  useEffect(() => {
    if (!shouldRender) return;
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [isDragging, dragOffset, shouldRender]);

  // Main Physics Loop
  useEffect(() => {
    if (!shouldRender) return;

    let rAF: number;
    
    const loop = (time: number) => {
      if (!lastTime.current) lastTime.current = time;
      lastTime.current = time;

      if (!isDragging) {
        let newX = pos.x;
        let newY = pos.y;

        // 1. Random Wandering Force
        vel.current.x += (Math.random() - 0.5) * 0.2;
        vel.current.y += (Math.random() - 0.5) * 0.2;

        // 2. Repulsion Force (Avoid Cursor)
        // "don't come near anything"
        const botCenterX = pos.x + 32;
        const botCenterY = pos.y + 40;
        const dx = botCenterX - mousePos.current.x;
        const dy = botCenterY - mousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If closer than 250px, push away
        if (dist < 250) {
            const force = (250 - dist) / 250; // 0 to 1
            const pushX = (dx / dist) * force * 1.5;
            const pushY = (dy / dist) * force * 1.5;
            vel.current.x += pushX;
            vel.current.y += pushY;
        }

        // Dampen velocity
        vel.current.x *= 0.98;
        vel.current.y *= 0.98;

        // Clamp Speed
        const maxSpeed = 2.0; 
        vel.current.x = Math.max(Math.min(vel.current.x, maxSpeed), -maxSpeed);
        vel.current.y = Math.max(Math.min(vel.current.y, maxSpeed), -maxSpeed);

        newX += vel.current.x;
        newY += vel.current.y;

        // Bounce off walls
        const size = 64;
        const padding = 20;
        
        if (newX < padding) { newX = padding; vel.current.x *= -0.8; }
        if (newX > window.innerWidth - size - padding) { newX = window.innerWidth - size - padding; vel.current.x *= -0.8; }
        if (newY < padding) { newY = padding; vel.current.y *= -0.8; }
        if (newY > window.innerHeight - size - padding) { newY = window.innerHeight - size - padding; vel.current.y *= -0.8; }

        setPos({ x: newX, y: newY });
      }

      // 3. Eye Tracking
      if (eyesRef.current) {
        const botCenterX = pos.x + 32; 
        const botCenterY = pos.y + 40; 
        
        const dx = mousePos.current.x - botCenterX;
        const dy = mousePos.current.y - botCenterY;
        const angle = Math.atan2(dy, dx);
        
        const maxEyeDistance = 4;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 20, maxEyeDistance);
        
        const eyeX = Math.cos(angle) * distance;
        const eyeY = Math.sin(angle) * distance;
        
        eyesRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
      }

      // 4. Bubble Positioning
      if (pos.x > window.innerWidth * 0.6) {
          setBubbleSide('left');
      } else {
          setBubbleSide('right');
      }
      
      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAF);
  }, [isDragging, pos, bubbleSide, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div 
      className="fixed top-0 left-0 z-[9999] touch-none select-none"
      style={{ 
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* ROBOT VISUALS */}
      <div className="relative w-16 h-20 pointer-events-none">
          <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'animate-float-medium'}`}>
              
              {/* Antenna */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-gray-400 dark:bg-gray-500 origin-bottom animate-[sway_3s_ease-in-out_infinite]">
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-2.5 transition-transform ${isBubbleVisible ? 'scale-125' : 'scale-100'}`}>
                     <div className={`w-full h-full relative ${isBubbleVisible ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-sm">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                     </div>
                  </div>
              </div>

              {/* Head */}
              <div className="relative z-10 w-16 h-14 bg-white dark:bg-gray-200 rounded-[1.2rem] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-[2px] border-white flex flex-col items-center justify-center overflow-hidden">
                  <div className="w-12 h-9 bg-[#111] rounded-[0.8rem] flex items-center justify-center relative overflow-hidden ring-1 ring-black/5">
                      {/* Eyes */}
                      <div ref={eyesRef} className="flex gap-1.5 items-center will-change-transform">
                          <div className={`w-2.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] ${isBubbleVisible ? 'animate-talk-blink' : 'animate-blink'}`}>
                             <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-60"></div>
                          </div>
                          <div className={`w-2.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] ${isBubbleVisible ? 'animate-talk-blink' : 'animate-blink'}`}>
                             <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-60"></div>
                          </div>
                      </div>
                      <div className={`absolute bottom-0.5 left-1.5 w-2 h-1.5 bg-pink-500/40 rounded-full blur-[2px] transition-opacity duration-500 ${isBubbleVisible ? 'opacity-100' : 'opacity-0'}`}></div>
                      <div className={`absolute bottom-0.5 right-1.5 w-2 h-1.5 bg-pink-500/40 rounded-full blur-[2px] transition-opacity duration-500 ${isBubbleVisible ? 'opacity-100' : 'opacity-0'}`}></div>
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                  </div>
              </div>

              {/* Body */}
              <div className="relative -mt-3 mx-auto w-8 h-7 bg-gray-100 dark:bg-gray-300 rounded-[0.6rem] shadow-sm border-[2px] border-white flex justify-center items-center z-0">
                  <div className="w-3 h-3 rounded-full bg-cyan-400/20 flex items-center justify-center">
                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan] animate-pulse"></div>
                  </div>
              </div>

              {/* Arms */}
              <div className="absolute top-8 -left-2 w-2.5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-sm border-2 border-gray-100 dark:border-gray-400 animate-[float_3s_ease-in-out_infinite] delay-100"></div>
              <div className="absolute top-8 -right-2 w-2.5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-sm border-2 border-gray-100 dark:border-gray-400 animate-[float_3s_ease-in-out_infinite] delay-300"></div>

              {/* Flame */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-0.5 opacity-90">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[ping_1s_linear_infinite]"></div>
              </div>
          </div>
      </div>

      {/* MESSAGE BUBBLE */}
      <div 
        className={`absolute top-0 w-64 md:w-72 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-${bubbleSide} ${
            isBubbleVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10 pointer-events-none'
        } ${
            bubbleSide === 'left' ? 'right-[110%]' : 'left-[110%]'
        }`}
      >
         <div className="relative">
             <div className="bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-2xl p-4 rounded-[1.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-white/40 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                 <p className="relative z-10 text-[13px] leading-relaxed font-medium text-gray-800 dark:text-gray-100 font-sans tracking-wide">
                     {displayedMessage}
                     <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                 </p>
             </div>
             <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_blue] ${
                 bubbleSide === 'left' ? '-right-4' : '-left-4'
             }`}></div>
         </div>
      </div>

      <style>{`
        @keyframes blink {
            0%, 96%, 100% { transform: scaleY(1); }
            98% { transform: scaleY(0.1); }
        }
        @keyframes talk-blink {
            0%, 100% { height: 14px; }
            50% { height: 10px; }
        }
        @keyframes sway {
            0%, 100% { transform: translateX(-50%) rotate(-5deg); }
            50% { transform: translateX(-50%) rotate(5deg); }
        }
        .animate-blink { animation: blink 3.5s infinite; }
        .animate-talk-blink { animation: talk-blink 0.2s infinite; }
      `}</style>
    </div>
  );
};

export default AssistantBot;