import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import { Project } from '../types';

type AdminView = 'dashboard' | 'projects-list' | 'messages-list' | 'project-editor' | 'message-viewer';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; type: 'project' | 'message'; id: string; name: string } | null>(null);

  // Form State
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
  const [techInput, setTechInput] = useState('');
  const [techStackList, setTechStackList] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  const [highlightsList, setHighlightsList] = useState<string[]>([]);

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

  const fetchMessages = async () => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    // Ensure 'seen' field is handled correctly. Defaults to false if not present in doc.
    setMessages(snap.docs.map(doc => ({ id: doc.id, seen: false, ...doc.data() })));
  };

  const fetchProjects = async () => {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) { 
      setError(err.message || 'Access Denied'); 
    }
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setCurrentView('message-viewer');
    
    if (!msg.seen) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, seen: true } : m));
      try {
        const msgRef = doc(db, "messages", msg.id);
        await updateDoc(msgRef, { seen: true });
      } catch (err) { 
        console.error("Update seen failed", err); 
      }
    }
  };

  const toggleMessageSeen = async (e: React.MouseEvent, msg: any) => {
    e.stopPropagation();
    const newStatus = !msg.seen;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, seen: newStatus } : m));
    try {
      await updateDoc(doc(db, "messages", msg.id), { seen: newStatus });
    } catch (err) {
      console.error("Toggle seen failed", err);
    }
  };

  const navigateToEditor = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({ title: proj.title, desc: proj.desc, liveUrl: proj.liveUrl || '', codeUrl: proj.codeUrl || '', imageUrl: proj.image });
      setTechStackList(proj.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean));
      setHighlightsList(proj.highlights || []);
    } else {
      setEditingProject(null);
      setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
      setTechStackList([]);
      setHighlightsList([]);
    }
    setCurrentView('project-editor');
  };

  const handleSaveProject = async () => {
    if (!projectForm.title) return alert("Title required.");
    const data = {
      ...projectForm,
      image: projectForm.imageUrl || 'https://via.placeholder.com/1200x800',
      stack: techStackList.join(' • '),
      highlights: highlightsList,
      order: editingProject ? editingProject.order : projects.length
    };
    try {
      if (editingProject) await updateDoc(doc(db, "projects", editingProject.id), data);
      else await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
      fetchProjects();
      setCurrentView('projects-list');
    } catch (err) { alert("Save error."); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      if (deleteModal.type === 'project') {
        await deleteDoc(doc(db, "projects", deleteModal.id));
        fetchProjects();
      } else {
        await deleteDoc(doc(db, "messages", deleteModal.id));
        fetchMessages();
        if (currentView === 'message-viewer') setCurrentView('messages-list');
      }
      setDeleteModal(null);
    } catch (e) { alert("Delete failed."); }
  };

  const handleDragStart = (index: number) => setDraggedItemIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => e.preventDefault();
  const handleDrop = async (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(draggedItemIndex, 1);
    reordered.splice(index, 0, moved);
    setProjects(reordered);
    setDraggedItemIndex(null);
    const batch = writeBatch(db);
    reordered.forEach((p, i) => batch.update(doc(db, "projects", p.id), { order: i }));
    await batch.commit();
  };

  const unseenCount = messages.filter(m => !m.seen).length;

  if (loading) return (
    <div className="h-screen bg-snow dark:bg-midnight flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing System...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-midnight p-4 relative overflow-hidden transition-colors duration-1000">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[140px] animate-blob pointer-events-none"></div>
      
      <div className="w-full max-w-[400px] glass-strong p-10 rounded-[2.5rem] border border-white/40 shadow-2xl z-10 animate-scale-in text-center">
        <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl transform hover:rotate-12 transition-transform duration-500">
          <span className="font-black text-2xl">BR</span>
        </div>
        <h2 className="text-[12px] font-black mb-10 text-gray-400 uppercase tracking-[0.5em]">Command_Access</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Identifier</label>
            <input 
              type="email" 
              placeholder="operator@bbhatt.com.np" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:border-blue-500/50 outline-none text-sm font-bold transition-all backdrop-blur-md" 
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Passphrase</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:border-blue-500/50 outline-none text-sm font-bold transition-all backdrop-blur-md" 
            />
          </div>
          <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6">
            Authorize Entry
          </button>
        </form>
        {error && <p className="mt-6 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full group flex items-center justify-between px-6 py-4 transition-all relative ${active ? 'text-white' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`absolute inset-y-1 left-3 right-3 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-transparent group-hover:bg-white/5'}`}></div>
      <div className="flex items-center gap-4 z-10">
        <i className={`fas ${icon} text-sm w-5 text-center transition-transform group-hover:scale-110`}></i>
        <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      {badge ? (
        <span className="z-10 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] flex items-center justify-center animate-pulse">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-midnight text-gray-900 dark:text-gray-200 font-sans overflow-hidden transition-colors duration-1000">
      
      {/* SIDEBAR */}
      <aside className="w-16 md:w-64 bg-black flex flex-col shrink-0 z-50 border-r border-white/5">
          <div className="p-8 pb-12 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl">BR</div>
              <div className="hidden md:block">
                <p className="font-black text-white text-[11px] tracking-widest uppercase leading-none">Command</p>
                <p className="font-bold text-gray-500 text-[9px] tracking-widest uppercase mt-1">v2.5.0-stable</p>
              </div>
          </div>
          <nav className="flex-1 space-y-1">
              <SidebarItem icon="fa-th-large" label="Overview" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-folder-open" label="Asset Base" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-satellite-dish" label="Signals" view="messages-list" active={currentView === 'messages-list'} badge={unseenCount > 0 ? unseenCount : undefined} />
          </nav>
          <div className="p-6">
              <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                  <i className="fas fa-power-off"></i>
                  <span className="hidden md:block">Disconnect</span>
              </button>
          </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
          
          <header className="h-20 bg-white/60 dark:bg-black/40 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-10 shrink-0 z-40">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{currentView.replace('-', ' ')}</h2>
                {currentView === 'project-editor' && <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></span>}
              </div>
              
              <div className="flex items-center gap-6">
                  <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-blue-500 transition-all flex items-center justify-center border border-black/5 dark:border-white/5">
                    <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
                  </button>
                  
                  <div className="relative group cursor-pointer" onClick={() => setCurrentView('messages-list')}>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:text-blue-500 transition-all flex items-center justify-center border border-black/5 dark:border-white/5">
                        <i className="fas fa-bell text-xs"></i>
                      </div>
                      {unseenCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-black font-black">
                          {unseenCount}
                        </span>
                      )}
                  </div>
                  
                  <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/5 pl-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Bhupesh Bhatt</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Root Architect</p>
                      </div>
                      <img src="https://ui-avatars.com/api/?name=B&background=2563EB&color=fff&bold=true&rounded=true" className="w-10 h-10 rounded-xl shadow-lg border-2 border-white dark:border-white/10" />
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar scroll-smooth">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-6xl mx-auto space-y-10">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                          <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">System Overview.</h1>
                          <p className="text-gray-500 font-medium mt-1">Real-time status of your digital ecosystem.</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                            <i className="fas fa-plus"></i> New Asset
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                               <i className="fas fa-folder text-blue-500"></i> Records
                             </p>
                             <p className="text-4xl font-black tracking-tighter">{projects.length}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase mt-3 tracking-widest">Deployed Assets</p>
                          </div>
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                               <i className="fas fa-satellite-dish text-purple-500"></i> Signal Log
                             </p>
                             <p className="text-4xl font-black tracking-tighter">{messages.length}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase mt-3 tracking-widest">Incoming Communications</p>
                          </div>
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                               <i className="fas fa-bell text-red-500"></i> Critical
                             </p>
                             <p className={`text-4xl font-black tracking-tighter ${unseenCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>{unseenCount}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase mt-3 tracking-widest">Pending Verification</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="glass-strong rounded-[2.5rem] border border-white dark:border-white/5 overflow-hidden flex flex-col h-[450px] shadow-sm hover:shadow-2xl transition-all">
                             <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Recent Assets</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-[9px] text-blue-600 font-black uppercase tracking-widest hover:underline">Full Repository</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {projects.slice(0, 8).map(p => (
                                    <div key={p.id} className="p-5 flex items-center gap-5 hover:bg-white/40 dark:hover:bg-white/5 transition-all cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                        <div className="w-14 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-black/5">
                                          <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-[14px] truncate group-hover:text-blue-600 transition-colors text-gray-800 dark:text-gray-200 tracking-tight">{p.title}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">{p.stack}</p>
                                        </div>
                                        <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 transition-colors"></i>
                                    </div>
                                ))}
                                {projects.length === 0 && <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Empty Archive</div>}
                             </div>
                          </div>

                          <div className="glass-strong rounded-[2.5rem] border border-white dark:border-white/5 overflow-hidden flex flex-col h-[450px] shadow-sm hover:shadow-2xl transition-all">
                             <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Communication Stream</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-[9px] text-blue-600 font-black uppercase tracking-widest hover:underline">All Signals</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {messages.slice(0, 8).map((m) => (
                                    <div key={m.id} className="p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-all cursor-pointer group" onClick={() => openMessage(m)}>
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-black/5 shadow-sm transition-colors ${m.seen ? 'bg-gray-100 dark:bg-white/10 text-gray-400' : 'bg-blue-600 text-white border-blue-600'}`}>
                                                  {m.name[0].toUpperCase()}
                                                </div>
                                                {!m.seen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-midnight rounded-full shadow-lg"></span>}
                                            </div>
                                            <div className="truncate">
                                                <div className="flex items-center gap-2">
                                                   <p className={`text-[14px] font-black truncate tracking-tight transition-colors ${!m.seen ? 'text-blue-600' : 'text-gray-800 dark:text-gray-200'}`}>{m.name}</p>
                                                   <i className={`fas ${m.seen ? 'fa-eye text-gray-300' : 'fa-eye-slash text-blue-500'} text-[10px]`}></i>
                                                </div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase truncate tracking-widest">{m.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Silence in the stream</div>}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECTS LIST */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-6xl mx-auto space-y-8">
                      <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-sm">
                          <div>
                            <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase tracking-[0.2em]">Asset Repository</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Manage & sequence your work archive.</p>
                          </div>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2">
                            <i className="fas fa-plus"></i> New Project
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                          {projects.map((p, idx) => (
                              <div 
                                key={p.id} 
                                draggable 
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                className={`glass-strong p-4 rounded-[1.8rem] border border-white dark:border-white/5 shadow-sm flex items-center gap-6 transition-all group ${draggedItemIndex === idx ? 'opacity-30' : 'hover:bg-white dark:hover:bg-white/10'}`}
                              >
                                  <div className="w-8 flex flex-col items-center gap-1 text-gray-300 cursor-grab active:cursor-grabbing hover:text-blue-500 transition-colors">
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                  </div>
                                  <div className="w-24 h-16 rounded-2xl overflow-hidden shrink-0 border border-black/5 shadow-inner">
                                    <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-base truncate text-gray-800 dark:text-gray-200 tracking-tight">{p.title}</p>
                                      <div className="flex gap-2 mt-1">
                                        {p.stack.split(/[•,]/).slice(0, 4).map((s, i) => (
                                          <span key={i} className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/10">{s.trim()}</span>
                                        ))}
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3 pr-4">
                                      <button onClick={() => navigateToEditor(p)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5 flex items-center justify-center">
                                        <i className="fas fa-edit text-[11px]"></i>
                                      </button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5 flex items-center justify-center">
                                        <i className="fas fa-trash-alt text-[11px]"></i>
                                      </button>
                                  </div>
                              </div>
                          ))}
                          {projects.length === 0 && (
                            <div className="p-32 text-center glass rounded-[2.5rem] border border-dashed border-gray-300 dark:border-white/10">
                              <i className="fas fa-inbox text-4xl text-gray-200 mb-4"></i>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Archival record empty</p>
                            </div>
                          )}
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-5xl mx-auto space-y-8">
                      <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-sm">
                          <div>
                            <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase tracking-[0.2em]">Signal Inbox</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Monitor incoming signals from the field.</p>
                          </div>
                      </div>

                      <div className="glass-strong rounded-[2.5rem] border border-white dark:border-white/5 overflow-hidden divide-y divide-black/5 shadow-sm">
                          {messages.map(m => (
                              <div key={m.id} onClick={() => openMessage(m)} className="p-6 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer group transition-all">
                                  <div className="flex items-center gap-6">
                                      <div className="relative">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm border transition-all ${!m.seen ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-white/10 text-gray-400 border-black/5 dark:border-white/5'}`}>
                                            {m.name[0].toUpperCase()}
                                          </div>
                                          {!m.seen && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-2 border-white dark:border-midnight rounded-full shadow-lg"></span>}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-3">
                                             <h4 className={`font-black text-base tracking-tight transition-colors ${!m.seen ? 'text-blue-600' : 'text-gray-800 dark:text-gray-200'}`}>{m.name}</h4>
                                             <button onClick={(e) => toggleMessageSeen(e, m)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${m.seen ? 'bg-gray-100 dark:bg-white/5 text-blue-500' : 'bg-blue-600/10 text-gray-400 hover:text-blue-500'}`} title={m.seen ? "Mark as unseen" : "Mark as seen"}>
                                                <i className={`fas ${m.seen ? 'fa-eye' : 'fa-eye-slash'} text-[12px]`}></i>
                                             </button>
                                          </div>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{m.email}</p>
                                      </div>
                                  </div>
                                  <div className="text-right flex items-center gap-8">
                                      <div className="hidden md:block">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Signal Logged</p>
                                        <p className="text-[11px] font-bold text-gray-500">{m.timestamp?.toDate().toLocaleString()}</p>
                                      </div>
                                      <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"></i>
                                  </div>
                              </div>
                          ))}
                          {messages.length === 0 && <div className="p-32 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">The stream is silent</div>}
                      </div>
                  </div>
              )}

              {/* PROJECT EDITOR */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-5xl mx-auto pb-32">
                      <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5">
                          <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase tracking-[0.1em]">{editingProject ? 'Modify Asset' : 'New Deployment'}</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Precision engineering of your showcase piece.</p>
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('projects-list')} className="px-8 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all">Abort</button>
                              <button onClick={handleSaveProject} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2">
                                <i className="fas fa-cloud-upload-alt"></i> Deploy Asset
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 space-y-8">
                              <section className="glass-strong p-10 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm space-y-8">
                                  <div className="space-y-1"><p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Essential Information</p></div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Project Identifier</label>
                                        <input 
                                          value={projectForm.title} 
                                          onChange={e => setProjectForm({...projectForm, title: e.target.value})} 
                                          className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-blue-500/50 transition-all" 
                                          placeholder="e.g. Project Neon"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Thumbnail Media URL</label>
                                        <input 
                                          value={projectForm.imageUrl} 
                                          onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} 
                                          className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-blue-500/50 transition-all" 
                                          placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Active Preview URL</label>
                                        <input 
                                          value={projectForm.liveUrl} 
                                          onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} 
                                          className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-blue-500/50 transition-all" 
                                          placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source Repository</label>
                                        <input 
                                          value={projectForm.codeUrl} 
                                          onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} 
                                          className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-blue-500/50 transition-all" 
                                          placeholder="https://github.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Detailed Narrative</label>
                                        <textarea 
                                          value={projectForm.desc} 
                                          onChange={e => setProjectForm({...projectForm, desc: e.target.value})} 
                                          className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl h-40 text-sm font-bold outline-none focus:border-blue-500/50 transition-all resize-none" 
                                          placeholder="Describe the architecture and vision..."
                                        />
                                    </div>
                                  </div>
                              </section>
                          </div>

                          <div className="space-y-8">
                              <section className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm space-y-8">
                                   <div className="space-y-6">
                                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Tech Arsenal</p>
                                       <div className="flex gap-2">
                                          <input 
                                            value={techInput} 
                                            onChange={e => setTechInput(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), techInput && (setTechStackList([...techStackList, techInput]), setTechInput('')))} 
                                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-blue-500/50" 
                                            placeholder="Add Tool..." 
                                          />
                                          <button onClick={() => { if(techInput) {setTechStackList([...techStackList, techInput]); setTechInput('');} }} className="w-12 h-12 bg-blue-600 text-white rounded-xl font-black text-lg flex items-center justify-center hover:bg-blue-500">+</button>
                                       </div>
                                       <div className="flex flex-wrap gap-2">
                                           {techStackList.map(t => (
                                               <span key={t} className="px-3 py-1.5 bg-blue-500/10 text-[10px] font-black uppercase text-blue-600 rounded-xl border border-blue-500/10 flex items-center gap-2 group transition-all hover:bg-blue-600 hover:text-white">
                                                   {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-gray-400 group-hover:text-white transition-colors">×</button>
                                               </span>
                                           ))}
                                       </div>
                                   </div>

                                   <div className="space-y-6 pt-6 border-t border-black/5">
                                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Key Highlights</p>
                                       <div className="flex gap-2">
                                          <input 
                                            value={highlightInput} 
                                            onChange={e => setHighlightInput(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), highlightInput && (setHighlightsList([...highlightsList, highlightInput]), setHighlightInput('')))} 
                                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-blue-500/50" 
                                            placeholder="Add Metric..." 
                                          />
                                          <button onClick={() => { if(highlightInput) {setHighlightsList([...highlightsList, highlightInput]); setHighlightInput('');} }} className="w-12 h-12 bg-blue-600 text-white rounded-xl font-black text-lg flex items-center justify-center hover:bg-blue-500">+</button>
                                       </div>
                                       <div className="space-y-2">
                                           {highlightsList.map((h, i) => (
                                               <div key={i} className="p-3 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-xl text-[10px] font-bold text-gray-500 flex justify-between items-center group hover:border-blue-500/20 transition-all">
                                                   <span className="truncate">{h}</span>
                                                   <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                     <i className="fas fa-times"></i>
                                                   </button>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                              </section>
                              
                              <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Preview Rendering</p>
                                <div className="aspect-[16/10] rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden border border-black/5">
                                  {projectForm.imageUrl ? (
                                    <img src={projectForm.imageUrl} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/1200x800?text=Invalid+Media+Link')} />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                      <i className="fas fa-image text-3xl mb-2"></i>
                                      <p className="text-[8px] font-black uppercase tracking-widest">No Media Linked</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGE VIEWER */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-10">
                      <div className="w-full max-w-2xl glass-strong rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-scale-in border border-white dark:border-white/5">
                          <div className="h-14 flex items-center px-8 justify-between bg-black/5 dark:bg-white/5">
                             <div className="flex gap-2">
                               <div onClick={() => setCurrentView('messages-list')} className="w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer hover:bg-red-500 transition-colors shadow-sm"></div>
                               <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"></div>
                               <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm"></div>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Signal_Log_Protocol</span>
                             <div className="flex items-center gap-4">
                               <button onClick={(e) => toggleMessageSeen(e, selectedMessage)} className={`text-[10px] font-black uppercase flex items-center gap-2 ${selectedMessage.seen ? 'text-blue-500' : 'text-gray-400'}`}>
                                 <i className={`fas ${selectedMessage.seen ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                 {selectedMessage.seen ? 'Seen' : 'Unseen'}
                               </button>
                               <i onClick={() => setCurrentView('messages-list')} className="fas fa-times text-[12px] text-gray-400 cursor-pointer hover:text-red-500 transition-colors"></i>
                             </div>
                          </div>
                          <div className="p-10 space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5">
                                 <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-1">Originator</span>
                                 <span className="text-gray-900 dark:text-white font-black text-base">{selectedMessage.name}</span>
                               </div>
                               <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5">
                                 <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-1">Data Stream</span>
                                 <span className="text-blue-600 font-black text-xs truncate block">{selectedMessage.email}</span>
                               </div>
                             </div>
                             <div className="p-8 min-h-[250px] text-gray-800 dark:text-gray-200 leading-[1.6] font-medium text-base whitespace-pre-wrap bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-black/5 shadow-inner">
                               {selectedMessage.message}
                             </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/5 p-8 flex justify-between items-center border-t border-black/5">
                             <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal: ${selectedMessage.name}` })} className="px-6 py-3 rounded-xl text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all">Purge Log</button>
                             <a href={`mailto:${selectedMessage.email}`} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 active:scale-0.98 transition-all">Reply Signal</a>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="w-full max-w-[350px] glass-strong rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl animate-scale-in text-center p-12">
                  <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-6 shadow-xl ${deleteModal.type === 'project' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-black dark:bg-white text-white dark:text-black shadow-black/20'}`}>
                    <i className="fas fa-trash-alt"></i>
                  </div>
                  <h3 className="text-xl font-black mb-2 tracking-tighter">Confirm Purge.</h3>
                  <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest leading-relaxed">System state change is irreversible.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-500 transition-all">Execute</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;