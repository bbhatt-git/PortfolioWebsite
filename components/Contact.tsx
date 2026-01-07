import React, { useState } from 'react';
import Reveal from './Reveal';
import Toast from './Toast';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Turnstile } from '@marsidev/react-turnstile';
import { sanitizeInput, isValidEmail, checkRateLimit, isValidLength } from '../utils/security';

interface ContactProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

const Contact: React.FC<ContactProps> = ({ onSuccess, onClose, isModal = false }) => {
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [token, setToken] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const sendToTelegram = async (name: string, email: string, message: string) => {
    const botToken = "8264328124:AAHweCg6xngZ2o17LItWQOKKyQ8bktQCc4A";
    const chatId = "8312999392";
    
    // Formatting the message for Telegram
    const text = `
🚀 *New Portfolio Inquiry*

👤 *Name:* ${name}
📧 *Email:* ${email}
📝 *Message:*
${message}

🔐 *Turnstile Verified*
    `;

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error("Telegram notification failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Anti-Bot: Turnstile Check
    if (!token) {
      showToast('Please complete the security check.', 'error');
      return;
    }

    // 2. DoS Protection: Rate Limiting
    if (!checkRateLimit()) {
      showToast('Too many requests. Please wait a minute.', 'error');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // 3. Input Sanitization (XSS Prevention)
    const rawName = formData.get("Name") as string;
    const rawEmail = formData.get("Email") as string;
    const rawMessage = formData.get("Message") as string;

    const name = sanitizeInput(rawName);
    const email = sanitizeInput(rawEmail);
    const message = sanitizeInput(rawMessage);

    // 4. Input Validation (Data Integrity & Resource Exhaustion)
    if (!isValidEmail(email)) {
        showToast('Invalid email address.', 'error');
        return;
    }

    if (!isValidLength(name, 100) || !isValidLength(message, 5000)) {
        showToast('Input too long.', 'error');
        return;
    }
    
    setStatus('submitting');
    try {
      // 5. Send to Firebase Firestore (Persistence)
      await addDoc(collection(db, "messages"), {
        to: "hello@bbhatt.com.np",
        name,
        email,
        message,
        seen: false, 
        timestamp: serverTimestamp()
      });

      // 6. Send to Telegram Bot (Notification)
      await sendToTelegram(name, email, message);

      setStatus('idle');
      form.reset();
      setToken(null); 
      
      showToast('Message sent successfully!', 'success');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending message: ", error);
      setStatus('idle');
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  // Safe access to environment variable
  const getSiteKey = () => {
    try {
      // @ts-ignore
      return (import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) || "0x4AAAAAACK_P8N4O1F3Hg6V";
    } catch {
      return "0x4AAAAAACK_P8N4O1F3Hg6V";
    }
  };
  const siteKey = getSiteKey();

  return (
    <section id="contact" className={`${isModal ? 'py-0 w-full flex justify-center' : 'py-24'} relative overflow-hidden`}>
      {/* Ambient Background Glow for Liquid Effect - Hidden in Modal */}
      {!isModal && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      )}

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className={`relative z-10 px-4 ${isModal ? 'w-full flex justify-center items-center' : 'container mx-auto max-w-4xl'}`}>
        
        {!isModal && (
            <Reveal variant="skew-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Let's start a project</h2>
                <p className="text-gray-500 dark:text-gray-400">Open for freelance opportunities and collaborations.</p>
            </div>
            </Reveal>
        )}

        <Reveal delay={isModal ? 0 : 200} variant="zoom-in" className={isModal ? 'w-full max-w-5xl' : 'w-full'}>
          {/* macOS Mail Window - Liquid Glass Style */}
          <div className={`group relative backdrop-blur-3xl bg-white/60 dark:bg-[#1c1c1e]/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 overflow-hidden ring-1 ring-white/20 transition-transform duration-500 ${isModal ? 'md:rounded-2xl rounded-3xl' : 'rounded-2xl hover:scale-[1.005]'}`}>
            
            {/* Reflective Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none opacity-50"></div>

            {/* Title Bar */}
            <div className={`bg-white/50 dark:bg-[#2c2c2e]/50 backdrop-blur-md h-12 flex items-center px-5 justify-between border-b border-black/5 dark:border-white/10 relative z-20 ${isModal ? 'hidden md:flex' : 'flex'}`}>
               <div className="flex gap-2 group/controls">
                 <div 
                    onClick={onClose} 
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm cursor-pointer flex items-center justify-center text-[9px] text-black/40 opacity-100 hover:opacity-80 transition-opacity"
                    title="Close"
                 >
                    <i className="fas fa-times opacity-0 group-hover/controls:opacity-100 transition-opacity"></i>
                 </div>
                 <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
                 <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
               </div>
               <div className="flex items-center gap-3 opacity-60 absolute left-1/2 -translate-x-1/2">
                  <i className="fas fa-paper-plane text-sm"></i>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">New Message</span>
               </div>
               <div className="w-12 flex justify-end opacity-40">
                 <i className="fas fa-reply text-sm"></i>
               </div>
            </div>

            {/* Mobile Header */}
            {isModal && (
                <div className="md:hidden pt-8 pb-4 px-6 text-center border-b border-black/5 dark:border-white/5 relative z-20">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Write Message</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Direct Line</p>
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>
            )}

            {/* Compose Area */}
            <div className="relative z-20">
              <form onSubmit={handleSubmit}>
                {/* To Field */}
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-black/5 dark:border-white/5 px-6 md:px-8 py-5 transition-colors hover:bg-white/20 dark:hover:bg-white/5 gap-2 sm:gap-0">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-bold w-20 tracking-wide">To:</span>
                  <div className="px-3 py-1.5 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-2 w-fit">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold shadow-sm">BP</span>
                    <span className="truncate">hello@bbhatt.com.np</span>
                  </div>
                </div>

                {/* Name Field */}
                <div className="flex items-center border-b border-black/5 dark:border-white/5 px-6 md:px-8 py-5 transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                  <label htmlFor="Name" className="text-gray-500 dark:text-gray-400 text-sm font-bold w-20 shrink-0 tracking-wide">Name:</label>
                  <input 
                    name="Name" 
                    id="Name" 
                    type="text" 
                    required 
                    placeholder="John Doe"
                    maxLength={100}
                    className="flex-1 bg-transparent outline-none text-base text-gray-900 dark:text-white placeholder-gray-400 font-medium min-w-0"
                  />
                </div>

                {/* Email Field */}
                <div className="flex items-center border-b border-black/5 dark:border-white/5 px-6 md:px-8 py-5 transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                  <label htmlFor="Email" className="text-gray-500 dark:text-gray-400 text-sm font-bold w-20 shrink-0 tracking-wide">Email:</label>
                  <input 
                    name="Email" 
                    id="Email" 
                    type="email" 
                    required 
                    placeholder="your.email@example.com"
                    maxLength={100}
                    className="flex-1 bg-transparent outline-none text-base text-gray-900 dark:text-white placeholder-gray-400 font-medium min-w-0"
                  />
                </div>

                {/* Message Body */}
                <div className="p-6 md:p-8">
                  <textarea 
                    name="Message" 
                    id="Message" 
                    rows={isModal ? 8 : 8}
                    required 
                    placeholder="Hi Bhupesh, I'd like to discuss a potential collaboration..."
                    maxLength={5000}
                    className="w-full bg-transparent outline-none text-base md:text-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none font-sans leading-relaxed"
                  ></textarea>
                </div>

                {/* Toolbar / Send */}
                <div className="bg-white/30 dark:bg-[#2c2c2e]/30 backdrop-blur-md px-6 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center border-t border-black/5 dark:border-white/5 gap-4">
                  <div className="flex gap-4 items-center">
                    <Turnstile 
                       siteKey={siteKey}
                       onSuccess={(token) => setToken(token)}
                       onExpire={() => setToken(null)}
                       onError={() => setToken(null)}
                       options={{
                         theme: 'auto',
                         size: 'compact'
                       }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={status === 'submitting' || !token}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-2.5 font-bold text-sm tracking-wide"
                    title={!token ? "Complete security check" : "Send Message"}
                  >
                    {status === 'submitting' ? (
                       <>
                         <i className="fas fa-spinner fa-spin"></i> Sending...
                       </>
                    ) : (
                       <>
                         <i className="fas fa-paper-plane"></i> Send Message
                       </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
        
        {/* Social Links Row */}
        {!isModal && (
            <Reveal delay={300} variant="3d">
            <div className="flex justify-center gap-6 md:gap-10 mt-16 flex-wrap">
                <a href="https://github.com/bbhatt-git" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    <i className="fab fa-github"></i>
                </div>
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">GitHub</span>
                </a>
                
                <a href="https://www.linkedin.com/in/bhattbhupesh" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#0077b5] transition-colors">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    <i className="fab fa-linkedin"></i>
                </div>
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">LinkedIn</span>
                </a>

                <a href="https://www.facebook.com/share/1BnJr4X2Ec/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#1877F2] transition-colors">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    <i className="fab fa-facebook"></i>
                </div>
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">Facebook</span>
                </a>

                <a href="https://www.instagram.com/_bbhatt/?igsh=MWdjZnc3Y2t6bXp1bA%3D%3D#" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#E4405F] transition-colors">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                    <i className="fab fa-instagram"></i>
                </div>
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">Instagram</span>
                </a>
            </div>
            </Reveal>
        )}
      </div>
    </section>
  );
};

export default Contact;