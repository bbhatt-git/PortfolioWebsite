import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'inbox' | 'projects'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    desc: '',
    stack: '',
    liveUrl: '',
    codeUrl: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchMessages();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const msgs: any[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate thumbnail from Live URL using thum.io
      // Resolution: 1200px width (Laptop standard for thumbnail)
      const generatedImage = projectForm.liveUrl 
        ? `https://image.thum.io/get/width/1200/crop/800/noanimate/${projectForm.liveUrl}`
        : 'https://via.placeholder.com/1200x800?text=No+Preview';

      await addDoc(collection(db, "projects"), {
        ...projectForm,
        image: generatedImage,
        createdAt: serverTimestamp()
      });
      alert('Project added successfully!');
      setProjectForm({ title: '', desc: '', stack: '', liveUrl: '', codeUrl: '' });
      setIsProjectModalOpen(false);
    } catch (err) {
      alert('Error adding project');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  // LOGIN SCREEN (macOS Lock Screen Style)
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center relative overflow-hidden font-sans"
           style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop")' }}>
        
        {/* Blur Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-xl"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-[scaleIn_0.4s_ease-out]">
           {/* Avatar */}
           <div className="w-24 h-24 rounded-full bg-gray-200 shadow-2xl mb-6 overflow-hidden border-4 border-white/10 relative">
             <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff" alt="User" className="w-full h-full object-cover" />
           </div>
           
           <h1 className="text-white text-2xl font-semibold mb-8 text-shadow-lg tracking-tight">Bhupesh Raj Bhatt</h1>
           
           <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-white/50 px-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:bg-white/20 transition-all text-sm text-center"
                required
              />
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/10 backdrop-blur-md text-white placeholder-white/50 px-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:bg-white/20 transition-all text-sm text-center"
                  required
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
           </form>
           
           {error && <p className="mt-4 text-red-300 text-xs bg-red-500/20 px-3 py-1 rounded-full backdrop-blur-md">{error}</p>}
        </div>

        <div className="absolute bottom-8 text-white/40 text-xs font-medium tracking-widest uppercase">
           Restricted Access
        </div>
      </div>
    );
  }

  // DASHBOARD (macOS Window Style)
  return (
    <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4 md:p-8 font-sans"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1621535496660-3136706e5797?q=80&w=2620&auto=format&fit=crop")' }}>
      
      {/* Background Dim */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl"></div>

      {/* Main Window */}
      <div className="relative z-10 w-full max-w-6xl h-[85vh] bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 flex overflow-hidden animate-[scaleIn_0.3s_ease-out]">
         
         {/* Sidebar */}
         <div className="w-20 md:w-64 bg-gray-50/50 dark:bg-[#252525]/50 border-r border-gray-200/50 dark:border-white/5 flex flex-col shrink-0 transition-all">
            {/* Window Controls */}
            <div className="h-14 flex items-center px-6 gap-2 shrink-0">
               <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm"></div>
               <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
               <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
               <div className="px-3 mb-2 hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Menu
               </div>
               
               <button 
                 onClick={() => setActiveTab('inbox')}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                   activeTab === 'inbox' 
                     ? 'bg-blue-500 text-white shadow-md' 
                     : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                 }`}
               >
                 <i className="fas fa-inbox w-5 text-center text-lg md:text-sm"></i>
                 <span className="hidden md:block">Inbox</span>
                 {messages.length > 0 && <span className="ml-auto bg-white/20 px-1.5 py-0.5 rounded text-[10px] hidden md:block">{messages.length}</span>}
               </button>

               <button 
                 onClick={() => setIsProjectModalOpen(true)}
                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
               >
                 <i className="fas fa-plus-square w-5 text-center text-lg md:text-sm"></i>
                 <span className="hidden md:block">New Project</span>
               </button>

               <div className="px-3 mt-6 mb-2 hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  System
               </div>

               <a 
                 href="/"
                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
               >
                 <i className="fas fa-globe w-5 text-center text-lg md:text-sm"></i>
                 <span className="hidden md:block">View Website</span>
               </a>
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
               <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-red-500 hover:opacity-70 transition-opacity w-full">
                  <i className="fas fa-sign-out-alt w-5 text-center"></i>
                  <span className="hidden md:block font-medium">Log Out</span>
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-white/30 dark:bg-black/20 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-6 shrink-0 backdrop-blur-md bg-white/40 dark:bg-[#1e1e1e]/40 sticky top-0 z-10">
               <h2 className="font-bold text-lg text-gray-800 dark:text-white">
                 {activeTab === 'inbox' ? 'Inbox' : 'Dashboard'}
               </h2>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               {activeTab === 'inbox' && (
                 <div className="max-w-4xl mx-auto space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                        <i className="fas fa-envelope-open text-4xl mb-4 opacity-30"></i>
                        <p>No messages available.</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="group bg-white/60 dark:bg-[#2c2c2e]/60 backdrop-blur-md p-4 rounded-xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-default">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                   {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                                 </div>
                                 <div>
                                   <h3 className="font-bold text-sm text-gray-900 dark:text-white">{msg.name}</h3>
                                   <p className="text-xs text-blue-600 dark:text-blue-400">{msg.email}</p>
                                 </div>
                              </div>
                              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : 'Just now'}
                              </span>
                           </div>
                           <div className="pl-13 mt-2">
                             <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5 leading-relaxed">
                               {msg.message}
                             </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* ADD PROJECT MODAL (macOS Sheet Style) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
           <div className="w-full max-w-lg bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#252525]">
                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add Project</h3>
                 <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <i className="fas fa-times"></i>
                 </button>
              </div>

              {/* Form Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <form onSubmit={handleAddProject} className="space-y-5">
                    
                    {/* Title Input */}
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Title</label>
                       <input 
                         type="text" 
                         value={projectForm.title}
                         onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                         className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                         placeholder="Project Name"
                         required
                       />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Description</label>
                       <textarea 
                         value={projectForm.desc}
                         onChange={e => setProjectForm({...projectForm, desc: e.target.value})}
                         className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm min-h-[100px] resize-none"
                         placeholder="Brief overview..."
                         required
                       />
                    </div>

                    {/* Stack Input */}
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Tech Stack</label>
                       <input 
                         type="text" 
                         value={projectForm.stack}
                         onChange={e => setProjectForm({...projectForm, stack: e.target.value})}
                         className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                         placeholder="React • Firebase • Tailwind"
                         required
                       />
                    </div>

                    {/* URLs Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Live URL</label>
                           <input 
                             type="url" 
                             value={projectForm.liveUrl}
                             onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})}
                             className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                             placeholder="https://"
                             required
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Code URL</label>
                           <input 
                             type="url" 
                             value={projectForm.codeUrl}
                             onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})}
                             className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                             placeholder="https://"
                           />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-500/10">
                        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                        <p className="text-xs text-blue-600 dark:text-blue-300 leading-snug">
                           Thumbnail will be automatically generated from the Live URL upon publishing.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setIsProjectModalOpen(false)}
                          className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
                        >
                          Publish
                        </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;