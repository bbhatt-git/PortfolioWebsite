import React, { useEffect, useRef, useState } from 'react';
import { useBot } from '../context/BotContext';

// --- CONTEXT-AWARE VOCABULARY ---

const PREFIXES = [
  "System:", "Core:", "UI:", "DOM:", "Audit:", "Trace:", "Log:", "Debug:", "Net:", "Event:", "State:", "Memo:", "Ref:", "Info:", "Bot:"
];

const ADJECTIVES = [
  "asynchronous", "concurrent", "recursive", "immutable", "volatile", "persistent", "virtual", 
  "responsive", "dynamic", "static", "relative", "absolute", "fixed", "floating", "cached", 
  "minified", "obfuscated", "secure", "encrypted", "hashed", "serialized", "vectorized", 
  "optimized", "redundant", "lazy-loaded", "hydrated", "server-side", "client-side", "atomic",
  "modular", "encapsulated", "inherited", "polymorphic", "abstract", "concrete", "reactive"
];

const TECH_NOUNS = [
  "component", "element", "node", "instance", "object", "entity", "reference", "interface", 
  "module", "directive", "fragment", "wrapper", "container", "layer", "tree", "graph", 
  "property", "attribute", "listener", "handler", "callback", "promise", "observable"
];

const SUFFIXES = [
  "- nominal.", "- active.", "- verified.", "- optimized.", "- 0ms latency.", "- rendered.", 
  "- watching.", "- interactive.", "- clean.", "- mounted.", "- updated.", "- stable.", 
  "- secure.", "- valid.", "- cached.", "- processed.", "- linked.", "- synced."
];

// Context-Specific Verbs
const VERBS = {
  NAVIGATION: [
    "Routing to", "Resolving", "Fetching", "Navigating", "Targeting", "Linking", "Prefetching", 
    "Requesting", "Handshaking", "Bridging", "Redirecting", "Locating", "Indexing"
  ],
  ACTION: [ // Buttons
    "Executing", "Triggering", "Dispatching", "Arming", "Initializing", "Invoking", "Firing", 
    "Binding", "Constructing", "Compiling", "Calculating", "Processing"
  ],
  INPUT: [ // Forms
    "Buffering", "Sanitizing", "Validating", "Debouncing", "Listening to", "Recording", "Capturing", 
    "Mutating", "Parsing", "Tokenizing", "Observing", "Tracking"
  ],
  INSPECTION: [ // Text, Images, Divs
    "Scanning", "Rendering", "Compositing", "Painting", "Measuring", "Layout", "Rasterizing", 
    "Analyzing", "Inspecting", "Detecting", "Profiling", "Tracing"
  ]
};

// --- ADVANCED CONTEXTUAL ENGINE ---

class ContextualMessageEngine {
  private history: Set<string>;
  private maxHistory: number;

  constructor() {
    this.history = new Set();
    this.maxHistory = 500;
  }

  private getRandom(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getElementLabel(el: HTMLElement): string {
    // 1. Try ARIA label
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label')!;
    // 2. Try Title or Alt
    if (el.getAttribute('title')) return el.getAttribute('title')!;
    if (el.getAttribute('alt')) return el.getAttribute('alt')!;
    // 3. Try Name or Placeholder (Inputs)
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const input = el as HTMLInputElement;
        return input.name || input.placeholder || input.type || 'Input';
    }
    // 4. Try Text Content (Cleaned)
    const text = el.innerText || el.textContent || '';
    const cleanText = text.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
    if (cleanText.length > 0 && cleanText.length < 25) return cleanText;
    
    // 5. Try Icon Analysis
    const icon = el.querySelector('i');
    if (icon) {
        if (icon.classList.contains('fa-github')) return 'GitHub';
        if (icon.classList.contains('fa-linkedin')) return 'LinkedIn';
        if (icon.classList.contains('fa-instagram')) return 'Instagram';
        if (icon.classList.contains('fa-facebook')) return 'Facebook';
        if (icon.classList.contains('fa-envelope')) return 'Email';
        if (icon.classList.contains('fa-phone')) return 'Phone';
        if (icon.classList.contains('fa-search')) return 'Search';
        if (icon.classList.contains('fa-bars')) return 'Menu';
        if (icon.classList.contains('fa-times')) return 'Close';
    }
    
    // 6. Fallback based on Tag
    return el.tagName.toLowerCase();
  }

  public generate(el: HTMLElement): string {
    const label = this.getElementLabel(el);
    const tag = el.tagName.toLowerCase();
    const type = el.getAttribute('type');
    const role = el.getAttribute('role');

    // Determine Context
    let contextVerbs = VERBS.INSPECTION;
    if (tag === 'a' || role === 'link') contextVerbs = VERBS.NAVIGATION;
    else if (tag === 'button' || role === 'button' || type === 'submit') contextVerbs = VERBS.ACTION;
    else if (tag === 'input' || tag === 'textarea') contextVerbs = VERBS.INPUT;

    // Generate Candidate: {Prefix} {Verb} {Adjective} '{Label}' {Noun} {Suffix}
    // "System: Routing to asynchronous 'Home' module - nominal."
    const prefix = this.getRandom(PREFIXES);
    const verb = this.getRandom(contextVerbs);
    const adj = this.getRandom(ADJECTIVES);
    const noun = this.getRandom(TECH_NOUNS);
    const suffix = this.getRandom(SUFFIXES);

    let candidate = `${prefix} ${verb} ${adj} '${label}' ${noun} ${suffix}`;

    // Retry Logic for Uniqueness
    let attempts = 0;
    while (this.history.has(candidate) && attempts < 5) {
        const v = this.getRandom(contextVerbs);
        const a = this.getRandom(ADJECTIVES);
        const n = this.getRandom(TECH_NOUNS);
        const s = this.getRandom(SUFFIXES);
        candidate = `${prefix} ${v} ${a} '${label}' ${n} ${s}`;
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

const engine = new ContextualMessageEngine();

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
          setPos({ x: window.innerWidth - 120, y: window.innerHeight - 200 });
       }
    };
    
    checkCapability();
    window.addEventListener('resize', checkCapability);
    return () => window.removeEventListener('resize', checkCapability);
  }, []);

  // --- INTERACTION LOGIC ---
  const handleInteraction = (el: HTMLElement) => {
      // 1. Priority: Custom explicit message
      const customMsg = el.getAttribute('data-bot-msg');
      if (customMsg) {
         const parts = customMsg.split('|');
         const randomPart = parts[Math.floor(Math.random() * parts.length)];
         say(randomPart, 4000);
         return;
      }

      // 2. Priority: Contextual Engine Generation
      const generatedMsg = engine.generate(el);
      say(generatedMsg, 3500);
  };

  useEffect(() => {
    if (!shouldRender) return;

    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Interact with specific elements
      const interactiveEl = target.closest('a, button, input, textarea, [role="button"], [data-bot-msg], img') as HTMLElement;

      if (interactiveEl) {
        if (lastHoveredElement.current !== interactiveEl) {
          lastHoveredElement.current = interactiveEl;
          handleInteraction(interactiveEl);
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
        const botCenterX = pos.x + 32;
        const botCenterY = pos.y + 40;
        const dx = botCenterX - mousePos.current.x;
        const dy = botCenterY - mousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If closer than 250px, push away
        if (dist < 250) {
            const force = (250 - dist) / 250; 
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