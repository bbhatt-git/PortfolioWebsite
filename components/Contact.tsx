import React, { useState } from 'react';
import Reveal from './Reveal';
import Toast from './Toast';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Contact: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setStatus('submitting');
    try {
      // Sending data to Firebase Firestore
      await addDoc(collection(db, "messages"), {
        to: "hello@bbhatt.com.np",
        name: formData.get("Name"),
        email: formData.get("Email"),
        message: formData.get("Message"),
        timestamp: serverTimestamp()
      });

      setStatus('idle');
      form.reset();
      showToast('Message sent successfully!', 'success');
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus('idle');
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Ambient Background Glow for Liquid Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <Reveal variant="skew-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Let's start a project</h2>
            <p className="text-gray-500 dark:text-gray-400">Open for freelance opportunities and collaborations.</p>
          </div>
        </Reveal>

        <Reveal delay={200} variant="zoom-in">
          {/* macOS Mail Window - Liquid Glass Style */}
          <div className="group relative backdrop-blur-3xl bg-white/40 dark:bg-[#1c1c1e]/40 rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 overflow-hidden ring-1 ring-white/20 transition-transform duration-500 hover:scale-[1.005]">
            
            {/* Reflective Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none opacity-50"></div>

            {/* Title Bar */}
            <div className="bg-white/50 dark:bg-[#2c2c2e]/50 backdrop-blur-md h-12 flex items-center px-4 md:px-5 justify-between border-b border-black/5 dark:border-white/10 relative z-20">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm"></div>
                 <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
                 <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
               </div>
               <div className="flex items-center gap-2 opacity-50">
                  <i className="fas fa-paper-plane text-xs"></i>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">New Message</span>
               </div>
               <div className="w-12 flex justify-end opacity-50">
                 <i className="fas fa-reply text-xs"></i>
               </div>
            </div>

            {/* Compose Area */}
            <div className="relative z-20">
              <form onSubmit={handleSubmit}>
                {/* To Field */}
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-black/5 dark:border-white/5 px-4 md:px-6 py-3 md:py-4 transition-colors hover:bg-white/20 dark:hover:bg-white/5 gap-2 sm:gap-0">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium w-16">To:</span>
                  <div className="px-3 py-1 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-md text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-2 w-fit">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shrink-0">BP</span>
                    <span className="truncate">hello@bbhatt.com.np</span>
                  </div>
                </div>

                {/* Name Field */}
                <div className="flex items-center border-b border-black/5 dark:border-white/5 px-4 md:px-6 py-3 md:py-4 transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                  <label htmlFor="Name" className="text-gray-500 dark:text-gray-400 text-sm font-medium w-16 shrink-0">Name:</label>
                  <input 
                    name="Name" 
                    id="Name" 
                    type="text" 
                    required 
                    placeholder="John Doe"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 font-medium min-w-0"
                  />
                </div>

                {/* Email Field */}
                <div className="flex items-center border-b border-black/5 dark:border-white/5 px-4 md:px-6 py-3 md:py-4 transition-colors hover:bg-white/20 dark:hover:bg-white/5">
                  <label htmlFor="Email" className="text-gray-500 dark:text-gray-400 text-sm font-medium w-16 shrink-0">Email:</label>
                  <input 
                    name="Email" 
                    id="Email" 
                    type="email" 
                    required 
                    placeholder="your.email@example.com"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 font-medium min-w-0"
                  />
                </div>

                {/* Message Body */}
                <div className="p-4 md:p-6">
                  <textarea 
                    name="Message" 
                    id="Message" 
                    rows={8} 
                    required 
                    placeholder="Hi Bhupesh, I'd like to discuss a potential collaboration..."
                    className="w-full bg-transparent outline-none text-base text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none font-sans leading-relaxed"
                  ></textarea>
                </div>

                {/* Toolbar / Send */}
                <div className="bg-white/30 dark:bg-[#2c2c2e]/30 backdrop-blur-md px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-black/5 dark:border-white/5 gap-4">
                  <div className="flex gap-5 text-gray-400 self-start sm:self-auto">
                    <button type="button" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><i className="fas fa-font"></i></button>
                    <button type="button" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><i className="fas fa-paperclip"></i></button>
                    <button type="button" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><i className="far fa-image"></i></button>
                    <button type="button" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><i className="far fa-smile"></i></button>
                  </div>
                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 font-medium text-sm"
                    title="Send Message"
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
        <Reveal delay={300} variant="3d">
          <div className="flex justify-center gap-6 md:gap-10 mt-16 flex-wrap">
            <a href="https://github.com/bbhatt-git" target="_blank" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
               <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                 <i className="fab fa-github"></i>
               </div>
               <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">GitHub</span>
            </a>
            
            <a href="https://www.linkedin.com/in/bhattbhupesh" target="_blank" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#0077b5] transition-colors">
               <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                 <i className="fab fa-linkedin"></i>
               </div>
               <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">LinkedIn</span>
            </a>

            <a href="https://www.facebook.com/share/1BnJr4X2Ec/" target="_blank" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#1877F2] transition-colors">
               <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                 <i className="fab fa-facebook"></i>
               </div>
               <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">Facebook</span>
            </a>

            <a href="https://www.instagram.com/_bbhatt/?igsh=MWdjZnc3Y2t6bXp1bA%3D%3D#" target="_blank" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#E4405F] transition-colors">
               <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-xl">
                 <i className="fab fa-instagram"></i>
               </div>
               <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">Instagram</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;