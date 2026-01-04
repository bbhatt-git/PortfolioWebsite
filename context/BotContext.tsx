import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface BotContextType {
  message: string | null;
  isVisible: boolean;
  say: (text: string, duration?: number) => void;
  shutup: () => void;
  emotion: 'neutral' | 'happy' | 'thinking' | 'excited';
  setEmotion: (emotion: 'neutral' | 'happy' | 'thinking' | 'excited') => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export const BotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'excited'>('neutral');
  const timeoutRef = useRef<any>(null);

  const say = useCallback((text: string, duration = 3000) => {
    setMessage(text);
    setEmotion('happy');
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessage(null);
        setEmotion('neutral');
      }, duration);
    }
  }, []);

  const shutup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(null);
    setEmotion('neutral');
  }, []);

  return (
    <BotContext.Provider value={{ message, isVisible, say, shutup, emotion, setEmotion }}>
      {children}
    </BotContext.Provider>
  );
};

export const useBot = () => {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
};