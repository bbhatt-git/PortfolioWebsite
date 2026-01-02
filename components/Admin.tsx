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
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this project?")) {
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
      const generatedImage = projectForm.liveUrl 
        ? `https://image.thum.io/get/width/1200/crop/800/noanimate/${projectForm.liveUrl}`
        : 'https://via.placeholder.com/1200x800?text=No+Preview';

      await addDoc(collection(db, "projects"), {
        ...projectForm,
        image: generatedImage,
        createdAt: serverTimestamp()
      });
      fetchProjects(); 
      setProjectForm({ title: '', desc: '', stack: '', liveUrl: '', codeUrl: '' });
      setIsProjectModalOpen(false);
    } catch (err) {
      alert('Error adding project');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#09090b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-8 md:p-10 animate-[scaleIn_0.3s_ease-out]">
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-black dark:bg-white rounded-xl mx-auto flex items-center justify-center mb-4">
                      <span className="font-mono font-bold text-2xl text-white dark:text-black">BR</span>
                   </div>
                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Enter your credentials to access the dashboard.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                   <div>
                       <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Email</label>
                       <input 
                         type="email" 
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                         placeholder="admin@example.com"
                         required
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Password</label>
                       <input 
                         type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                         placeholder="••••••••"
                         required
                       />
                   </div>
                   
                   <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-2">
                       Sign In
                   </button>
                </form>
                
                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-[#09090b] font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-20 lg:w-64 bg-white dark:bg-[#18181b] border-r border-gray-200 dark:border-white/5 flex flex-col flex-shrink-0 z-20">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 dark:border-white/5">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-mono font-bold text-xs text-white dark:text-black">BR</span>
                </div>
                <span className="ml-3 font-bold text-lg hidden lg:block">Admin</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <button 
                  onClick={() => setActiveTab('inbox')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'inbox' 
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <i className="fas fa-inbox w-5 text-center text-lg lg:text-base"></i>
                  <span className="hidden lg:block">Inbox</span>
                  {messages.length > 0 && <span className="ml-auto bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs font-bold hidden lg:block">{messages.length}</span>}
                </button>

                <button 
                  onClick={() => setActiveTab('projects')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'projects' 
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <i className="fas fa-layer-group w-5 text-center text-lg lg:text-base"></i>
                  <span className="hidden lg:block">Projects</span>
                  {projects.length > 0 && <span className="ml-auto bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs font-bold hidden lg:block">{projects.length}</span>}
                </button>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                   <i className="fas fa-sign-out-alt w-5 text-center text-lg lg:text-base"></i>
                   <span className="hidden lg:block">Log Out</span>
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 relative">
            {/* Header */}
            <header className="h-16 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-10">
                <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                           BB
                        </div>
                        <span className="text-sm font-medium hidden md:block">Bhupesh</span>
                     </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                
                {/* --- INBOX VIEW --- */}
                {activeTab === 'inbox' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                           {messages.length === 0 ? (
                             <div className="p-12 text-center text-gray-400">
                               <i className="fas fa-envelope-open text-4xl mb-3 opacity-30"></i>
                               <p>No messages yet.</p>
                             </div>
                           ) : (
                             <div className="divide-y divide-gray-100 dark:divide-white/5">
                               {messages.map((msg) => (
                                 <div 
                                   key={msg.id}
                                   onClick={() => setSelectedMessage(msg)}
                                   className="p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex flex-col md:flex-row gap-3 md:items-center group"
                                 >
                                    <div className="flex items-center gap-4 md:w-1/4">
                                       <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                                          {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                                       </div>
                                       <div className="min-w-0">
                                          <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{msg.name}</p>
                                          <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                                       </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{msg.message}</p>
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap md:text-right md:w-24">
                                       {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : 'Now'}
                                    </div>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                    </div>
                )}

                {/* --- PROJECTS VIEW --- */}
                {activeTab === 'projects' && (
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                           <p className="text-gray-500 text-sm">Manage your portfolio projects.</p>
                           <button 
                             onClick={() => setIsProjectModalOpen(true)}
                             className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                           >
                             <i className="fas fa-plus"></i> Add Project
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                           {projects.map((proj) => (
                              <div key={proj.id} className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                                 <div className="h-48 bg-gray-100 dark:bg-black/50 relative overflow-hidden">
                                     <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                     <div className="absolute top-2 right-2">
                                        <button 
                                          onClick={(e) => handleDeleteProject(proj.id, e)}
                                          className="w-8 h-8 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                        >
                                          <i className="fas fa-trash-alt text-xs"></i>
                                        </button>
                                     </div>
                                 </div>
                                 <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-1">{proj.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{proj.desc}</p>
                                    
                                    <div className="flex gap-2 border-t border-gray-100 dark:border-white/5 pt-4">
                                       {proj.liveUrl && (
                                         <a href={proj.liveUrl} target="_blank" className="text-xs px-2.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                                           Live Demo
                                         </a>
                                       )}
                                       {proj.codeUrl && (
                                         <a href={proj.codeUrl} target="_blank" className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                           Code
                                         </a>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* --- MESSAGE DETAIL MODAL --- */}
        {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                       <h3 className="font-bold text-lg">Message Detail</h3>
                       <button onClick={() => setSelectedMessage(null)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                          <i className="fas fa-times text-sm"></i>
                       </button>
                   </div>
                   <div className="p-6 overflow-y-auto">
                       <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                               {selectedMessage.name ? selectedMessage.name.charAt(0).toUpperCase() : '?'}
                           </div>
                           <div>
                               <h4 className="font-bold text-lg">{selectedMessage.name}</h4>
                               <p className="text-blue-500 text-sm">{selectedMessage.email}</p>
                               <p className="text-xs text-gray-400 mt-1">{selectedMessage.timestamp?.toDate ? selectedMessage.timestamp.toDate().toLocaleString() : ''}</p>
                           </div>
                       </div>
                       <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                           {selectedMessage.message}
                       </div>
                   </div>
                   <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                        <a 
                          href={`mailto:${selectedMessage.email}`}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                           <i className="fas fa-reply"></i> Reply
                        </a>
                   </div>
                </div>
            </div>
        )}

        {/* --- ADD PROJECT MODAL --- */}
        {isProjectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white dark:bg-[#18181b] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                       <h3 className="font-bold text-lg">Add New Project</h3>
                       <button onClick={() => setIsProjectModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                          <i className="fas fa-times text-sm"></i>
                       </button>
                   </div>
                   <div className="p-6 overflow-y-auto">
                      <form onSubmit={handleAddProject} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                            <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                            <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors h-24 resize-none" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tech Stack</label>
                            <input type="text" value={projectForm.stack} onChange={e => setProjectForm({...projectForm, stack: e.target.value})} placeholder="React • Node • Firebase" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Live URL</label>
                                <input type="url" value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Code URL</label>
                                <input type="url" value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">Publish</button>
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