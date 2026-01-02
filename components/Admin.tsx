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
    window.location.hash = ''; // Redirect to home after logout
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

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal if clicking delete
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
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-[scaleIn_0.4s_ease-out]">
           {/* Avatar */}
           <div className="w-24 h-24 rounded-full bg-gray-200 shadow-2xl mb-6 overflow-hidden border-4 border-white/10 relative ring-1 ring-white/20">
             <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff" alt="User" className="w-full h-full object-cover" />
           </div>
           
           <h1 className="text-white text-2xl font-semibold mb-8 text-shadow-lg tracking-tight">Bhupesh Raj Bhatt</h1>
           
           <form onSubmit={handleLogin} className="flex flex-col gap-4 w-72">
              <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden p-1 flex flex-col gap-px border border-white/20 shadow-xl">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-transparent text-white placeholder-white/50 px-4 py-2.5 text-sm text-center outline-none focus:bg-white/10 transition-colors rounded-t-lg"
                    required
                  />
                  <div className="h-px w-full bg-white/10"></div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-transparent text-white placeholder-white/50 px-4 py-2.5 text-sm text-center outline-none focus:bg-white/10 transition-colors rounded-b-lg"
                    required
                  />
              </div>
              <button type="submit" className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
                 <span>Log In</span> <i className="fas fa-arrow-right text-xs"></i>
              </button>
           </form>
           
           {error && <p className="mt-6 text-red-200 text-xs bg-red-500/20 px-4 py-2 rounded-full backdrop-blur-md border border-red-500/30">{error}</p>}
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50">
            <i className="fas fa-lock text-white/50 text-xl"></i>
            <div className="text-white/50 text-[10px] font-medium tracking-widest uppercase">
              System Locked
            </div>
        </div>
      </div>
    );
  }

  // DASHBOARD (macOS Window Style)
  return (
    <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-0 md:p-8 font-sans overflow-hidden bg-gray-900"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2670&auto=format&fit=crop")' }}>
      
      {/* Background Dim */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl"></div>

      {/* Main Window Container */}
      <div className="relative z-10 w-full md:max-w-[1200px] h-screen md:h-[85vh] bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl md:rounded-xl shadow-2xl border-none md:border border-white/20 flex overflow-hidden animate-[scaleIn_0.3s_ease-out]">
         
         {/* SIDEBAR */}
         <div className="w-20 md:w-64 bg-gray-50/80 dark:bg-[#252525]/80 border-r border-gray-200/50 dark:border-white/5 flex flex-col shrink-0 backdrop-blur-xl transition-all duration-300">
            
            {/* Window Controls (Traffic Lights) */}
            <div className="h-14 flex items-center px-6 gap-2 shrink-0 border-b border-transparent">
               <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm"></div>
               <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
               <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
               <div className="px-3 mb-2 hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  System
               </div>
               
               {/* Inbox Tab */}
               <button 
                 onClick={() => setActiveTab('inbox')}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                   activeTab === 'inbox' 
                     ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                     : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                 }`}
               >
                 <i className={`fas fa-inbox w-5 text-center text-lg md:text-sm ${activeTab === 'inbox' ? 'text-white' : 'text-blue-500'}`}></i>
                 <span className="hidden md:block">Inbox</span>
                 {messages.length > 0 && <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] hidden md:block font-bold ${activeTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{messages.length}</span>}
               </button>

               {/* Projects Tab */}
               <button 
                 onClick={() => setActiveTab('projects')}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                   activeTab === 'projects' 
                     ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                     : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                 }`}
               >
                 <i className={`fas fa-layer-group w-5 text-center text-lg md:text-sm ${activeTab === 'projects' ? 'text-white' : 'text-purple-500'}`}></i>
                 <span className="hidden md:block">Projects</span>
                 {projects.length > 0 && <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] hidden md:block font-bold ${activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{projects.length}</span>}
               </button>

               <div className="px-3 mt-6 mb-2 hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Manage
               </div>

               <button 
                 onClick={() => setIsProjectModalOpen(true)}
                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
               >
                 <i className="fas fa-plus-circle w-5 text-center text-lg md:text-sm text-green-500"></i>
                 <span className="hidden md:block">New Project</span>
               </button>

               <a 
                 href="/"
                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
               >
                 <i className="fas fa-external-link-alt w-5 text-center text-lg md:text-sm text-gray-400"></i>
                 <span className="hidden md:block">View Site</span>
               </a>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200/50 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-md">
               <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors w-full group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    BB
                  </div>
                  <div className="hidden md:flex flex-col items-start overflow-hidden">
                     <span className="text-xs font-bold truncate w-full">Bhupesh Bhatt</span>
                     <span className="text-[10px] opacity-60 group-hover:text-red-500 truncate">Log Out</span>
                  </div>
               </button>
            </div>
         </div>

         {/* CONTENT AREA */}
         <div className="flex-1 bg-white/60 dark:bg-[#1c1c1e]/60 flex flex-col relative overflow-hidden backdrop-blur-md">
            
            {/* Header Bar */}
            <div className="h-14 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-md sticky top-0 z-10">
               <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                 {activeTab === 'inbox' ? <><i className="fas fa-inbox text-blue-500"></i> Inbox</> : <><i className="fas fa-project-diagram text-purple-500"></i> Projects</>}
               </h2>
               <div className="flex items-center gap-2">
                 <div className="hidden md:flex items-center bg-gray-100/50 dark:bg-black/20 rounded-md px-3 py-1.5 border border-transparent focus-within:border-blue-500/50 transition-all">
                    <i className="fas fa-search text-gray-400 text-xs mr-2"></i>
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-32 text-gray-600 dark:text-gray-300" />
                 </div>
               </div>
            </div>

            {/* Scrollable List - Removed bg-noise to fix pointer-events issue */}
            <div className="flex-1 overflow-y-auto p-6 relative">
               
               {/* --- INBOX VIEW --- */}
               {activeTab === 'inbox' && (
                 <div className="max-w-4xl mx-auto space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                        <i className="fas fa-envelope-open text-4xl mb-4 opacity-30"></i>
                        <p>No messages yet.</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          onClick={() => setSelectedMessage(msg)}
                          className="bg-white/80 dark:bg-[#2c2c2e]/80 backdrop-blur-sm p-4 rounded-xl border border-white/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-white dark:hover:bg-[#3a3a3c] group flex gap-4 items-start"
                        >
                           <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                             {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex justify-between">
                               <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{msg.name}</h3>
                               <span className="text-[10px] text-gray-400">
                                 {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : 'Now'}
                               </span>
                             </div>
                             <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">{msg.email}</p>
                             <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 opacity-80">{msg.message}</p>
                           </div>
                           <i className="fas fa-chevron-right text-gray-300 text-xs self-center opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                      ))
                    )}
                 </div>
               )}

               {/* --- PROJECTS VIEW --- */}
               {activeTab === 'projects' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {projects.map((proj) => (
                      <div key={proj.id} className="group bg-white/80 dark:bg-[#2c2c2e]/80 backdrop-blur-sm rounded-xl border border-white/60 dark:border-white/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full hover:-translate-y-1 relative z-0">
                         <div className="h-40 bg-gray-100 dark:bg-black/50 relative overflow-hidden">
                            <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute top-2 right-2 z-10">
                               <button 
                                 onClick={(e) => handleDeleteProject(proj.id, e)}
                                 className="w-8 h-8 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 transform hover:scale-110 cursor-pointer"
                                 title="Delete Project"
                               >
                                 <i className="fas fa-trash-alt text-xs"></i>
                               </button>
                            </div>
                         </div>
                         <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{proj.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{proj.desc}</p>
                            <div className="flex gap-2 mt-auto">
                               {proj.liveUrl && <a href={proj.liveUrl} target="_blank" className="text-[10px] px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">Live</a>}
                               {proj.codeUrl && <a href={proj.codeUrl} target="_blank" className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded">Code</a>}
                            </div>
                         </div>
                      </div>
                    ))}
                    
                    {/* Add New Project Card */}
                    <button 
                      onClick={() => setIsProjectModalOpen(true)}
                      className="min-h-[250px] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all gap-3 bg-white/30 dark:bg-white/5"
                    >
                       <div className="w-14 h-14 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-xl">
                         <i className="fas fa-plus"></i>
                       </div>
                       <span className="text-sm font-semibold">Create New Project</span>
                    </button>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* --- FULL PAGE MESSAGE READER (macOS Mail Style) --- */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
           <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out] relative">
              
              {/* Toolbar */}
              <div className="bg-[#f6f6f6] dark:bg-[#2c2c2e] border-b border-gray-200 dark:border-black/50 h-14 flex items-center justify-between px-4 shrink-0 select-none">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedMessage(null)} 
                      className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                    >
                       <i className="fas fa-arrow-left mr-1"></i> Back
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <button className="text-gray-500 hover:text-red-500 transition-colors"><i className="fas fa-trash"></i></button>
                    <button className="text-gray-500 hover:text-blue-500 transition-colors"><i className="fas fa-folder"></i></button>
                 </div>
                 
                 <div className="flex gap-4 text-gray-500">
                    <button className="hover:text-black dark:hover:text-white transition-colors" title="Reply"><i className="fas fa-reply"></i></button>
                    <button className="hover:text-black dark:hover:text-white transition-colors" title="Forward"><i className="fas fa-share"></i></button>
                 </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
                 {/* Header Info */}
                 <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                    <div className="flex justify-between items-start mb-4">
                       <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Portfolio Inquiry</h1>
                       <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                          {selectedMessage.timestamp?.toDate ? selectedMessage.timestamp.toDate().toLocaleString() : ''}
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                          {selectedMessage.name ? selectedMessage.name.charAt(0).toUpperCase() : 'U'}
                       </div>
                       <div>
                          <div className="font-bold text-gray-900 dark:text-white text-base">
                             {selectedMessage.name} <span className="font-normal text-gray-500 text-sm">&lt;{selectedMessage.email}&gt;</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">To: Bhupesh Raj Bhatt</div>
                       </div>
                    </div>
                 </div>

                 {/* Body Text */}
                 <div className="flex-1 p-8 overflow-y-auto text-gray-800 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                    {selectedMessage.message}
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-gray-50 dark:bg-[#252525] border-t border-gray-200 dark:border-white/5 flex justify-end gap-3">
                 <a href={`mailto:${selectedMessage.email}`} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium flex items-center gap-2">
                    <i className="fas fa-reply"></i> Reply via Email
                 </a>
              </div>
           </div>
        </div>
      )}

      {/* --- ADD PROJECT MODAL --- */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
           <div className="w-full max-w-lg bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#252525]">
                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Project</h3>
                 <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <i className="fas fa-times"></i>
                 </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <form onSubmit={handleAddProject} className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project Title</label>
                       <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="mt-1 w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none shadow-sm" required />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                       <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="mt-1 w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none shadow-sm h-24 resize-none" required />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tech Stack</label>
                       <input type="text" value={projectForm.stack} onChange={e => setProjectForm({...projectForm, stack: e.target.value})} placeholder="e.g. React • Node • MongoDB" className="mt-1 w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live URL</label>
                           <input type="url" value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="mt-1 w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none shadow-sm" required />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Code URL</label>
                           <input type="url" value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="mt-1 w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none shadow-sm" />
                        </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-500/10">
                        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                        <p className="text-xs text-blue-600 dark:text-blue-300">Thumbnail will be auto-generated.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all">Publish Project</button>
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