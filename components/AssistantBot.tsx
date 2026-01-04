import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useBot } from '../context/BotContext';

// --- MESSAGE ENGINE (Combinatorial & Massive Arrays) ---

// 1. Specific High-Value Categories (Deck of Cards Logic)
const MESSAGES_DB: Record<string, string[]> = {
  github: [
     "Auditing the source code?", "Spying on my commits?", "It's open source, enjoy!", "Git push origin master!", 
     "Checking the architecture?", "Found a bug? Let me know.", "Clean code principles only.", "Fork it if you dare.",
     "Exploring the repo?", "Version control is life.", "Analyzing the diffs?", "Code quality check: Pass.",
     "Don't worry, secrets are in .env", "Looking for the README?", "Star the repo please!", "Commit early, commit often.",
     "Branching out?", "Merging happiness.", "Pull requests welcome.", "Git status: Clean.", "Searching for logic?",
     "Peeking under the hood.", "Reverse engineering?", "It runs on my machine.", "Console.log('Hello');",
     "Zero warnings, hopefully.", "Typescript or bust.", "Main branch protected.", "Deploying to prod...",
     "Reviewing the syntax."
  ],
  linkedin: [
     "Let's connect professionally!", "Expand the network.", "Endorse my skills?", "Viewing the profile.",
     "Let's talk business.", "Recruiting?", "Check out the experience.", "Professional mode activated.",
     "Networking opportunity detected.", "Sending a connection request?", "Open to opportunities.",
     "Career timeline loaded.", "Skill validation required.", "Let's sync up.", "Business inquiries?",
     "Checking credentials.", "Verified developer.", "Endorsements welcome.", "Let's build a partnership.",
     "Viewing professional history."
  ],
  contact: [
     "Sliding into the DMs?", "Send a message!", "I reply fast.", "Let's build something together.",
     "Inquiries welcome.", "Say hello!", "Don't be shy.", "Collaboration starts here.", "Got an idea?",
     "Writing an email?", "Feedback is appreciated.", "Start a conversation.", "Business proposal?",
     "Hiring?", "Let's chat.", "Transmission channel open.", "Awaiting input.", "Contact form ready.",
     "Spam filters active.", "Reach out!"
  ],
  theme: [
     "Flashbang!", "Lights out.", "Dark mode is better.", "Protecting your eyes.", "Switching aesthetics.",
     "Toggling the vibe.", "Day / Night cycle.", "Theme change detected.", "Adjusting brightness.",
     "Visual overhaul.", "Going dark.", "Let there be light.", "Mood lighting.", "CSS variable swap.",
     "Restyling DOM.", "Repainting pixels.", "Contrast adjustment.", "Saving battery?", "Midnight mode.",
     "Solar flare mode."
  ]
};

// 2. Combinatorial Generator for Generic Elements (>500 variations)
const PREFIXES = [
  "Analyzing", "Scanning", "Detecting", "Observing", "Targeting", "Locked on", "Hovering", "Noticing", "Checking", "Identifying",
  "Processing", "Computing", "Zooming in on", "Focusing on", "Highlighting", "Reading", "Parsing", "Inspecting", "Tracking", "Watching"
];
const SUBJECTS = [
  "this element", "that pixel", "the cursor path", "your selection", "the component", "this interface", "the UI", "that button",
  "the interaction", "user input", "the layout", "the geometry", "the vector", "this div", "the attribute", "the link",
  "your mouse", "the coordinates", "the style", "the animation", "the glow", "the shadow", "the gradient", "the code"
];
const SUFFIXES = [
  ".", "!", "?", "...", " - interesting.", " - nice choice.", " - calculated.", " - approved.", " - optimal.", " - precise.",
  " - curious.", " - detected.", " - valid.", " - render complete.", " - frame perfect.", " - aesthetic.", " - functional."
];

// Helper to get a random item and remove it (No Repeats until empty)
class MessageDeck {
  private original: string[];
  private deck: string[];

  constructor(items: string[]) {
    this.original = items;
    this.deck = [...items];
  }

  draw(): string {
    if (this.deck.length === 0) {
      this.deck = [...this.original]; // Reshuffle
    }
    const index = Math.floor(Math.random() * this.deck.length);
    return this.deck.splice(index, 1)[0];
  }
}

// Generate massive generic deck
const generateGenericDeck = () => {
    const deck: string[] = [];
    // Combinatorial
    PREFIXES.forEach(p => {
        SUBJECTS.forEach(s => {
            SUFFIXES.forEach(x => {
                if (Math.random() > 0.8) deck.push(`${p} ${s}${x}`); // Take 20% to avoid memory bloat but still huge
            });
        });
    });
    // Add manual witty ones
    deck.push(
        "I see you.", "Click it, I dare you.", "Nice hover.", "Pixel perfect.", "Grid aligned.", "System nominal.",
        "Rendering...", "Frame rate stable.", "GPU accelerating.", "Reacting...", "State updated.", "Effect triggered.",
        "Dependencies loaded.", "Compiling...", "Bundling...", "Minifying...", "Optimizing...", "Caching...",
        "Fetching data...", "Awaiting promise...", "Event listener fired.", "Bubble phase.", "Capture phase.",
        "DOM manipulated.", "Virtual DOM diffing.", "Hydration complete.", "Next.js routing.", "Tailwind styling.",
        "Responsive design.", "Mobile first.", "Accessibility check.", "SEO optimized.", "Lighthouse score: 100.",
        "PWA ready.", "Manifest loaded.", "Service worker active.", "Local storage synced.", "Session valid.",
        "Cookies accepted.", "GDPR compliant.", "Firewall active.", "Encryption: AES-256.", "Handshake complete.",
        "Packet received.", "Latency: 12ms.", "Bandwidth: High.", "Resolution: 4K.", "Aspect ratio: 16:9.",
        "Color space: P3.", "Gamma corrected."
    );
    return deck;
};

// Global Engine Instance
const engines: Record<string, MessageDeck> = {
    github: new MessageDeck(MESSAGES_DB.github),
    linkedin: new MessageDeck(MESSAGES_DB.linkedin),
    contact: new MessageDeck(MESSAGES_DB.contact),
    theme: new MessageDeck(MESSAGES_DB.theme),
    generic: new MessageDeck(generateGenericDeck())
};

const AssistantBot: React.FC = () => {
  const { message, say } = useBot();
  const eyesRef = useRef<HTMLDivElement>(null);
  
  // State
  const [pos, setPos] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left');
  
  // Message Animation State
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // Physics Refs
  const vel = useRef({ x: -0.5, y: -0.3 });
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastTime = useRef(0);
  const lastHoveredElement = useRef<HTMLElement | null>(null);

  // --- MESSAGE GENERATION LOGIC ---
  const getInteractionMessage = (el: HTMLElement): string => {
    const customMsg = el.getAttribute('data-bot-msg');
    if (customMsg) {
       const parts = customMsg.split('|');
       return parts[Math.floor(Math.random() * parts.length)];
    }

    const tag = el.tagName.toLowerCase();
    const text = (el.innerText || el.getAttribute('aria-label') || '').toLowerCase();
    const href = (el.getAttribute('href') || '').toLowerCase();

    if (href.includes('github')) return engines.github.draw();
    if (href.includes('linkedin')) return engines.linkedin.draw();
    if (href.includes('mailto') || text.includes('contact')) return engines.contact.draw();
    if (text.includes('theme') || text.includes('mode')) return engines.theme.draw();

    return engines.generic.draw();
  };

  // --- GLOBAL HOVER LISTENER ---
  useEffect(() => {
    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, input, textarea, img, [role="button"], [data-bot-msg]') as HTMLElement;

      if (interactiveEl) {
        if (lastHoveredElement.current !== interactiveEl) {
          lastHoveredElement.current = interactiveEl;
          const msg = getInteractionMessage(interactiveEl);
          say(msg, 3500);
        }
      } else {
        lastHoveredElement.current = null;
      }
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener('mouseover', handleGlobalMouseOver);
    window.addEventListener('mousemove', handleGlobalMouseOver);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      window.removeEventListener('mousemove', handleGlobalMouseOver);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [say]);

  // Sync displayed message with context to handle animation timings
  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      setIsBubbleVisible(true);
    } else {
      setIsBubbleVisible(false);
      // clear text after animation
      const t = setTimeout(() => setDisplayedMessage(null), 300);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragOffset({ x: clientX - pos.x, y: clientY - pos.y });
    vel.current = { x: 0, y: 0 };
    say("Weeee!", 1500);
  };

  const handleWindowMouseUp = () => setIsDragging(false);

  const handleWindowMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    setPos({ x: clientX - dragOffset.x, y: clientY - dragOffset.y });
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchend', handleWindowMouseUp);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('touchmove', handleWindowMouseMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchend', handleWindowMouseUp);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('touchmove', handleWindowMouseMove);
    };
  }, [isDragging, dragOffset]);

  // Main Physics Loop
  useEffect(() => {
    let rAF: number;
    
    const loop = (time: number) => {
      if (!lastTime.current) lastTime.current = time;
      lastTime.current = time;

      // 1. MOVEMENT LOGIC (Random Wandering)
      if (!isDragging) {
        let newX = pos.x;
        let newY = pos.y;

        vel.current.x += (Math.random() - 0.5) * 0.15;
        vel.current.y += (Math.random() - 0.5) * 0.15;
        vel.current.x *= 0.98;
        vel.current.y *= 0.98;

        const maxSpeed = 1.0; // Slightly slower for cuteness
        vel.current.x = Math.max(Math.min(vel.current.x, maxSpeed), -maxSpeed);
        vel.current.y = Math.max(Math.min(vel.current.y, maxSpeed), -maxSpeed);

        newX += vel.current.x;
        newY += vel.current.y;

        // Boundaries
        const size = 64; // Smaller size
        const padding = 10;
        
        if (newX < padding) { newX = padding; vel.current.x *= -0.8; }
        if (newX > window.innerWidth - size - padding) { newX = window.innerWidth - size - padding; vel.current.x *= -0.8; }
        if (newY < padding) { newY = padding; vel.current.y *= -0.8; }
        if (newY > window.innerHeight - size - padding) { newY = window.innerHeight - size - padding; vel.current.y *= -0.8; }

        setPos({ x: newX, y: newY });
      }

      // 2. EYE TRACKING LOGIC
      if (eyesRef.current) {
        const botCenterX = pos.x + 32; // Half of w-16 (64px)
        const botCenterY = pos.y + 40; // Half of h-20 (80px)
        
        const dx = mousePos.current.x - botCenterX;
        const dy = mousePos.current.y - botCenterY;
        const angle = Math.atan2(dy, dx);
        
        const maxEyeDistance = 4; // Smaller eye movement range
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 20, maxEyeDistance);
        
        const eyeX = Math.cos(angle) * distance;
        const eyeY = Math.sin(angle) * distance;
        
        eyesRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
      }

      // 3. BUBBLE POSITIONING
      if (pos.x > window.innerWidth * 0.6) {
          setBubbleSide('left');
      } else {
          setBubbleSide('right');
      }
      
      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAF);
  }, [isDragging, pos, bubbleSide]);

  return (
    <div 
      className="fixed top-0 left-0 z-[9999] touch-none select-none"
      style={{ 
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* 
        --------------------------
        RESIZED CUTE ROBOT (w-16 h-20)
        --------------------------
      */}
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
                  
                  {/* Face Screen */}
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

                      {/* Blush */}
                      <div className={`absolute bottom-0.5 left-1.5 w-2 h-1.5 bg-pink-500/40 rounded-full blur-[2px] transition-opacity duration-500 ${isBubbleVisible ? 'opacity-100' : 'opacity-0'}`}></div>
                      <div className={`absolute bottom-0.5 right-1.5 w-2 h-1.5 bg-pink-500/40 rounded-full blur-[2px] transition-opacity duration-500 ${isBubbleVisible ? 'opacity-100' : 'opacity-0'}`}></div>
                      
                      {/* Gloss */}
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

      {/* 
        --------------------------
        MODERN MESSAGE BUBBLE UI
        --------------------------
      */}
      <div 
        className={`absolute top-0 w-64 md:w-72 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-${bubbleSide} ${
            isBubbleVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10 pointer-events-none'
        } ${
            bubbleSide === 'left' ? 'right-[110%]' : 'left-[110%]'
        }`}
      >
         <div className="relative">
             {/* Glassmorphism Bubble */}
             <div className="bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-2xl p-4 rounded-[1.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-white/40 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
                 
                 {/* Decorative background glow */}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                 
                 {/* Typewriter Text Effect Container */}
                 <p className="relative z-10 text-[13px] leading-relaxed font-medium text-gray-800 dark:text-gray-100 font-sans tracking-wide">
                     {displayedMessage}
                     <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                 </p>
             </div>

             {/* Connecting Dot instead of triangle for modern look */}
             <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_blue] ${
                 bubbleSide === 'left' ? '-right-4' : '-left-4'
             }`}></div>
             <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-300 opacity-50 ${
                 bubbleSide === 'left' ? '-right-2' : '-left-2'
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