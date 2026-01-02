import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Project } from '../types';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'inbox' | 'projects'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // UI State
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
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
        fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const projs: Project[] = [];
      querySnapshot.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projs);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Failed to delete project.");
      }
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate thumbnail from Live URL using thum.io
      const generatedImage = projectForm.liveUrl 
        ? `https://image.thum.io/get/width/1200/crop/800/noanimate/${projectForm.liveUrl}`
        : 'https://via.placeholder.com/1200x800?text=No+Preview';

      await addDoc(collection(db, "projects"), {
        ...projectForm,
        image: generatedImage,
        createdAt: serverTimestamp()
      });
      fetchProjects(); // Refresh list
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
           style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}>
        
        {/* Blur Overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-[scaleIn_0.4s_ease-out]">
           {/* Avatar */}
           <div className="w-28 h-28 rounded-full bg-gray-200 shadow-2xl mb-8 overflow-hidden border-4 border-white/10 relative ring-1 ring-white/20">
             <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff" alt="User" className="w-full h-full object-cover" />
           </div>
           
           <h1 className="text-white text-3xl font-bold mb-8 text-shadow-lg tracking-tight">Bhupesh Raj Bhatt</h1>
           
           <form onSubmit={handleLogin} className="flex flex-col gap-4 w-72">
              <div className="glass-strong rounded-xl overflow-hidden p-1 flex flex-col gap-1 bg-white/10 border-white/20">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-transparent text-white placeholder-white/40 px-4 py-2 text-sm text-center outline-none focus:bg-white/5 transition-colors rounded-lg"
                    required
                  />
                  <div className="h-px w-full bg-white/10"></div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-transparent text-white placeholder-white/40 px-4 py-2 text-sm text-center outline-none focus:bg-white/5 transition-colors rounded-lg"
                    required
                  />
              </div>
              <button type="submit" className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg">
                <i className="fas fa-arrow-right mr-2"></i> Enter System
              </button>
           </form>
           
           {error && <p className="mt-6 text-red-200 text-xs bg-red-500/20 px-4 py-2 rounded-full backdrop-blur-md border border-red-500/30">{error}</p>}
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-2">
            <i className="fas fa-fingerprint text-white/20 text-3xl"></i>
            <div className="text-white/30 text-[10px] font-medium tracking-[0.2em] uppercase">
              Secure Environment
            </div>
        </div>
      </div>
    );
  }

  // DASHBOARD (macOS Window Style)
  return (
    <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2670&auto=format&fit=crop")' }}>
      
      {/* Background Dim */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>

      {/* Main Window */}
      <div className="relative z-10 w-full max-w-7xl h-[85vh] bg-white/70 dark:bg-[#1e1e1e]/60 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 flex overflow-hidden animate-[scaleIn_0.3s_ease-out] ring-1 ring-black/5">
         
         {/* Sidebar */}
         <div className="w-20 md:w-64 bg-gray-100/50 dark:bg-[#252525]/50 border-r border-gray-200/50 dark:border-white/5 flex flex-col shrink-0 transition-all backdrop-blur-xl">
            {/* Window Controls */}
            <div className="h-14 flex items-center px-6 gap-2 shrink-0 border-b border-transparent">
               <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm cursor-pointer hover:bg-[#FF5F57]/80"></div>
               <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm cursor-pointer hover:bg-[#FFBD2E]/80"></div>
               <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm cursor-pointer hover:bg-[#28C840]/80"></div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
               <div className="px-3 mb-2 hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Main
               </div>
               
               <button 
                 onClick={() => setActiveTab('inbox')}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                   activeTab === 'inbox' 
                     ? 'bg-blue-500/90 text-white shadow-md shadow-blue-500/20' 
                     : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                 }`}
               >
                 <i className={`fas fa-inbox w-5 text-center text-lg md:text-sm ${activeTab === 'inbox' ? 'text-white' : 'text-blue-500'}`}></i>
                 <span className="hidden md:block">Inbox</span>
                 {messages.length > 0 && <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] hidden md:block ${activeTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{messages.length}</span>}
               </button>

               <button 
                 onClick={() => setActiveTab('projects')}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                   activeTab === 'projects' 
                     ? 'bg-blue-500/90 text-white shadow-md shadow-blue-500/20' 
                     : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                 }`}
               >
                 <i className={`fas fa-layer-group w-5 text-center text-lg md:text-sm ${activeTab === 'projects' ? 'text-white' : 'text-purple-500'}`}></i>
                 <span className="hidden md:block">Projects</span>
                 {projects.length > 0 && <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] hidden md:block ${activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{projects.length}</span>}
               </button>

               <div className="px-3 mt-6 mb-2 hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Actions
               </div>

               <button 
                 onClick={() => setIsProjectModalOpen(true)}
                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
               >
                 <i className="fas fa-plus w-5 text-center text-lg md:text-sm text-green-500"></i>
                 <span className="hidden md:block">Add Project</span>
               </button>

               <a 
                 href="/"
                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
               >
                 <i className="fas fa-globe w-5 text-center text-lg md:text-sm text-gray-400"></i>
                 <span className="hidden md:block">Live Site</span>
               </a>
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-200/50 dark:border-white/5 bg-white/20 dark:bg-black/10 backdrop-blur-md">
               <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors w-full group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    BR
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                     <span className="text-xs font-semibold">Bhupesh Bhatt</span>
                     <span className="text-[10px] opacity-50 group-hover:text-red-500">Sign Out</span>
                  </div>
                  <i className="fas fa-sign-out-alt ml-auto opacity-0 group-hover:opacity-100 text-red-500 transition-all hidden md:block"></i>
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-white/40 dark:bg-black/30 flex flex-col relative overflow-hidden backdrop-blur-md">
            {/* Header */}
            <div className="h-14 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-md sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  <h2 className="font-bold text-lg text-gray-800 dark:text-white tracking-tight">
                    {activeTab === 'inbox' ? 'Inbox' : 'Project Manager'}
                  </h2>
               </div>
               
               {/* Search / Status */}
               <div className="flex items-center gap-4">
                 <div className="relative hidden sm:block">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input type="text" placeholder="Search..." className="bg-gray-100/50 dark:bg-black/20 border border-transparent focus:border-blue-500/50 rounded-md pl-8 pr-3 py-1.5 text-xs outline-none transition-all w-48 text-gray-600 dark:text-gray-300" />
                 </div>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-noise">
               
               {/* INBOX VIEW */}
               {activeTab === 'inbox' && (
                 <div className="max-w-5xl mx-auto">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                           <i className="fas fa-inbox text-3xl opacity-30"></i>
                        </div>
                        <p>Your inbox is empty.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((msg) => (
                          <div 
                            key={msg.id} 
                            onClick={() => setSelectedMessage(msg)}
                            className="group bg-white/60 dark:bg-[#2c2c2e]/60 backdrop-blur-md p-4 rounded-xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-white/80 dark:hover:bg-[#3a3a3c] flex items-center gap-4 active:scale-[0.99]"
                          >
                             <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                             
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-sm border border-white/20 shrink-0">
                               {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                             </div>
                             
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-baseline mb-0.5">
                                 <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{msg.name}</h3>
                                 <span className="text-[10px] font-medium text-gray-400 shrink-0 ml-2">
                                   {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now'}
                                 </span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[300px]">{msg.message}</p>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                  <p className="text-[10px] text-blue-500 dark:text-blue-400 truncate">{msg.email}</p>
                               </div>
                             </div>
                             
                             <i className="fas fa-chevron-right text-gray-300 dark:text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               )}

               {/* PROJECTS VIEW */}
               {activeTab === 'projects' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                      <div key={proj.id} className="group relative bg-white/60 dark:bg-[#2c2c2e]/60 backdrop-blur-md rounded-xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                         <div className="h-32 bg-gray-200 dark:bg-black/50 overflow-hidden relative">
                            {proj.image && <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </div>
                         <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{proj.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{proj.desc}</p>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-white/5">
                               <div className="flex gap-2">
                                 {proj.liveUrl && <a href={proj.liveUrl} target="_blank" className="text-xs text-blue-500 hover:underline">Live</a>}
                                 {proj.codeUrl && <a href={proj.codeUrl} target="_blank" className="text-xs text-gray-500 hover:underline">Code</a>}
                               </div>
                               <button 
                                 onClick={() => handleDeleteProject(proj.id)}
                                 className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                 title="Delete Project"
                               >
                                 <i className="fas fa-trash-alt text-xs"></i>
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                    
                    {/* Add New Card */}
                    <button 
                      onClick={() => setIsProjectModalOpen(true)}
                      className="min-h-[200px] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all gap-2"
                    >
                       <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                         <i className="fas fa-plus"></i>
                       </div>
                       <span className="text-sm font-medium">Create New Project</span>
                    </button>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* MESSAGE READER (macOS Mail Style Window) */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
           <div className="w-full max-w-4xl h-[80vh] bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out] relative">
              
              {/* Window Bar */}
              <div className="bg-[#f6f6f6] dark:bg-[#2c2c2e] border-b border-gray-200 dark:border-black/50 h-12 flex items-center justify-between px-4 shrink-0 select-none">
                 <div className="flex gap-2">
                    <button onClick={() => setSelectedMessage(null)} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm hover:bg-[#FF5F57]/80 flex items-center justify-center group">
                       <i className="fas fa-times text-[6px] opacity-0 group-hover:opacity-100 text-black/60"></i>
                    </button>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
                 </div>
                 
                 <div className="flex gap-4 text-gray-400">
                    <i className="fas fa-reply hover:text-gray-600 transition-colors cursor-pointer"></i>
                    <i className="fas fa-reply-all hover:text-gray-600 transition-colors cursor-pointer"></i>
                    <i className="fas fa-forward hover:text-gray-600 transition-colors cursor-pointer"></i>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                    <i className="fas fa-trash hover:text-red-500 transition-colors cursor-pointer"></i>
                 </div>
              </div>

              {/* Message Header */}
              <div className="px-8 py-6 bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-white/5">
                 <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Inquiry via Portfolio</h2>
                    <span className="text-sm text-gray-400">
                       {selectedMessage.timestamp?.toDate ? selectedMessage.timestamp.toDate().toLocaleString() : ''}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xl text-gray-500">
                       <i className="fas fa-user"></i>
                    </div>
                    <div className="flex flex-col">
                       <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {selectedMessage.name} <span className="font-normal text-gray-500 dark:text-gray-400">&lt;{selectedMessage.email}&gt;</span>
                       </span>
                       <span className="text-xs text-gray-500">To: Bhupesh Raj Bhatt</span>
                    </div>
                 </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 leading-relaxed text-base whitespace-pre-wrap font-serif">
                 {selectedMessage.message}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 dark:bg-[#252525] border-t border-gray-200 dark:border-white/5 flex justify-end gap-3">
                 <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Close</button>
                 <a href={`mailto:${selectedMessage.email}`} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <i className="fas fa-reply"></i> Reply
                 </a>
              </div>
           </div>
        </div>
      )}

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