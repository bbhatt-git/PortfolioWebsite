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
    // Ensure we handle docs that might not have 'seen' field yet, default to false
    setMessages(snap.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        seen: data.seen ?? false 
      };
    }));
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

  // Persistently update Firestore 'seen' field
  const updateMessageSeenStatus = async (msgId: string, status: boolean) => {
    try {
      const msgRef = doc(db, "messages", msgId);
      await updateDoc(msgRef, { seen: status });
      // Update local state to reflect change immediately
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, seen: status } : m));
    } catch (err) {
      console.error("Failed to update seen status in Firestore", err);
    }
  };

  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setCurrentView('message-viewer');
    
    // Auto-mark as seen when opened if it wasn't already
    if (!msg.seen) {
      await updateMessageSeenStatus(msg.id, true);
    }
  };

  const handleToggleSeen = async (e: React.MouseEvent, msgId: string, currentStatus: boolean) => {
    e.stopPropagation(); // Prevent opening the message
    await updateMessageSeenStatus(msgId, !currentStatus);
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
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>
      <div className="w-full max-w-[400px] glass-strong p-10 rounded-[2.5rem] border border-white/40 shadow-2xl z-10 animate-scale-in text-center">
        <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl">
          <span className="font-black text-2xl">BR</span>
        </div>
        <h2 className="text-[12px] font-black mb-10 text-gray-400 uppercase tracking-[0.5em]">Command_Access</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Identifier" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 outline-none text-sm font-bold" />
          <input type="password" placeholder="Passphrase" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 outline-none text-sm font-bold" />
          <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20">Authorize Entry</button>
        </form>
        {error && <p className="mt-6 text-[10px] text-red-500 font-bold uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button onClick={() => setCurrentView(view)} className={`w-full group flex items-center justify-between px-6 py-4 transition-all relative ${active ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
      <div className={`absolute inset-y-1 left-3 right-3 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-transparent group-hover:bg-white/5'}`}></div>
      <div className="flex items-center gap-4 z-10">
        <i className={`fas ${icon} text-sm w-5 text-center`}></i>
        <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      {badge ? <span className="z-10 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] flex items-center justify-center">{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-midnight text-gray-900 dark:text-gray-200 font-sans overflow-hidden transition-colors duration-1000">
      
      <aside className="w-16 md:w-64 bg-black flex flex-col shrink-0 z-50 border-r border-white/5">
          <div className="p-8 flex items-center gap-4"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">BR</div><div className="hidden md:block"><p className="font-black text-white text-[11px] tracking-widest uppercase leading-none">Command</p></div></div>
          <nav className="flex-1 space-y-1">
              <SidebarItem icon="fa-th-large" label="Overview" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-folder-open" label="Asset Base" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-satellite-dish" label="Signals" view="messages-list" active={currentView === 'messages-list'} badge={unseenCount > 0 ? unseenCount : undefined} />
          </nav>
          <div className="p-6"><button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-[9px] font-black uppercase tracking-[0.2em] text-gray-500"><i className="fas fa-power-off"></i><span className="hidden md:block">Disconnect</span></button></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-20 bg-white/60 dark:bg-black/40 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-10 shrink-0 z-40">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{currentView.replace('-', ' ')}</h2>
              <div className="flex items-center gap-6">
                  <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-blue-500 transition-all border border-black/5 flex items-center justify-center"><i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xs`}></i></button>
                  <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/5 pl-6"><img src="https://ui-avatars.com/api/?name=B&background=2563EB&color=fff&bold=true&rounded=true" className="w-10 h-10 rounded-xl shadow-lg border-2 border-white dark:border-white/10" /></div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-6xl mx-auto space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5"><p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Assets</p><p className="text-4xl font-black">{projects.length}</p></div>
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5"><p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Signals</p><p className="text-4xl font-black">{messages.length}</p></div>
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white dark:border-white/5"><p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Unread</p><p className={`text-4xl font-black ${unseenCount > 0 ? 'text-red-500' : ''}`}>{unseenCount}</p></div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="glass-strong rounded-[2.5rem] overflow-hidden flex flex-col h-[450px]">
                             <div className="px-8 py-6 border-b border-black/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Recent Asset Entries</h3></div>
                             <div className="flex-1 overflow-y-auto divide-y divide-black/5">
                                {projects.slice(0, 8).map(p => (
                                    <div key={p.id} className="p-5 flex items-center gap-5 hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer" onClick={() => navigateToEditor(p)}>
                                        <img src={p.image} className="w-14 h-10 rounded-xl object-cover" />
                                        <div className="flex-1 min-w-0"><p className="font-black text-[14px] truncate">{p.title}</p></div>
                                    </div>
                                ))}
                             </div>
                          </div>

                          <div className="glass-strong rounded-[2.5rem] overflow-hidden flex flex-col h-[450px]">
                             <div className="px-8 py-6 border-b border-black/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Signal Stream</h3></div>
                             <div className="flex-1 overflow-y-auto divide-y divide-black/5">
                                {messages.slice(0, 8).map((m) => (
                                    <div key={m.id} className="p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer" onClick={() => openMessage(m)}>
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${m.seen ? 'bg-gray-100 text-gray-400 border-black/5' : 'bg-blue-600 text-white border-blue-600'}`}>
                                              {m.name[0].toUpperCase()}
                                            </div>
                                            <div className="truncate">
                                                <div className="flex items-center gap-2">
                                                  <p className={`text-[14px] font-black truncate ${!m.seen ? 'text-blue-600' : ''}`}>{m.name}</p>
                                                  <button onClick={(e) => handleToggleSeen(e, m.id, m.seen)} className="hover:text-blue-500 transition-colors">
                                                    <i className={`fas ${m.seen ? 'fa-eye' : 'fa-eye-slash'} text-[10px]`}></i>
                                                  </button>
                                                </div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase truncate tracking-widest">{m.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-6xl mx-auto space-y-8">
                      <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 p-6 rounded-[2rem] border border-white dark:border-white/5">
                          <h1 className="text-2xl font-black uppercase tracking-[0.2em]">Asset Repository</h1>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">New Entry</button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {projects.map((p, idx) => (
                              <div key={p.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} className="glass-strong p-4 rounded-[1.8rem] flex items-center gap-6 group hover:bg-white dark:hover:bg-white/10 transition-all">
                                  <div className="w-8 flex flex-col items-center gap-1 text-gray-300 cursor-grab active:cursor-grabbing"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                                  <img src={p.image} className="w-24 h-16 rounded-2xl object-cover border border-black/5 shadow-inner" />
                                  <div className="flex-1 min-w-0"><p className="font-black text-base truncate">{p.title}</p></div>
                                  <div className="flex items-center gap-3 pr-4">
                                      <button onClick={() => navigateToEditor(p)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-blue-600 flex items-center justify-center border border-black/5"><i className="fas fa-edit text-[11px]"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-red-500 flex items-center justify-center border border-black/5"><i className="fas fa-trash-alt text-[11px]"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-5xl mx-auto space-y-8">
                      <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 p-6 rounded-[2rem] border border-white dark:border-white/5">
                          <h1 className="text-2xl font-black uppercase tracking-[0.2em]">Signal Inbox</h1>
                      </div>
                      <div className="glass-strong rounded-[2.5rem] overflow-hidden divide-y divide-black/5">
                          {messages.map(m => (
                              <div key={m.id} onClick={() => openMessage(m)} className="p-6 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer transition-all">
                                  <div className="flex items-center gap-6">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base border transition-all ${!m.seen ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-400 border-black/5'}`}>
                                        {m.name[0].toUpperCase()}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-3">
                                            <h4 className={`font-black text-base tracking-tight ${!m.seen ? 'text-blue-600' : ''}`}>{m.name}</h4>
                                            <button onClick={(e) => handleToggleSeen(e, m.id, m.seen)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${m.seen ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400'}`}>
                                              <i className={`fas ${m.seen ? 'fa-eye' : 'fa-eye-slash'} text-[12px]`}></i>
                                            </button>
                                          </div>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{m.email}</p>
                                      </div>
                                  </div>
                                  <span className="text-[11px] font-bold text-gray-500">{m.timestamp?.toDate().toLocaleString()}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-5xl mx-auto pb-32">
                      <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5">
                          <h1 className="text-3xl font-black tracking-tighter uppercase">{editingProject ? 'Modify Asset' : 'New Deployment'}</h1>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('projects-list')} className="px-8 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest">Abort</button>
                              <button onClick={handleSaveProject} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Deploy Asset</button>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 glass-strong p-10 rounded-[2.5rem] space-y-8">
                              <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-2xl outline-none font-bold" placeholder="Project Name" />
                              <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-2xl outline-none font-bold" placeholder="Image URL" />
                              <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-2xl outline-none font-bold" placeholder="Live Preview URL" />
                              <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-2xl outline-none font-bold" placeholder="Source URL" />
                              <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-2xl h-40 font-bold outline-none resize-none" placeholder="Description" />
                          </div>
                          <div className="space-y-8">
                              <section className="glass-strong p-8 rounded-[2.5rem] space-y-6">
                                   <div className="flex gap-2">
                                      <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-black/5 rounded-xl text-xs font-bold outline-none" placeholder="Add Tech..." />
                                      <button onClick={() => { if(techInput) {setTechStackList([...techStackList, techInput]); setTechInput('');} }} className="w-12 h-12 bg-blue-600 text-white rounded-xl">+</button>
                                   </div>
                                   <div className="flex flex-wrap gap-2">{techStackList.map(t => (<span key={t} className="px-3 py-1.5 bg-blue-500/10 text-[10px] font-black uppercase text-blue-600 rounded-xl flex items-center gap-2">{t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))}>×</button></span>))}</div>
                              </section>
                              <div className="glass-strong p-4 rounded-[2.5rem] overflow-hidden"><img src={projectForm.imageUrl || 'https://via.placeholder.com/400x300'} className="w-full rounded-2xl" /></div>
                          </div>
                      </div>
                  </div>
              )}

              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-10">
                      <div className="w-full max-w-2xl glass-strong rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white dark:border-white/5">
                          <div className="h-14 flex items-center px-8 justify-between bg-black/5 dark:bg-white/5">
                             <div className="flex gap-2"><div onClick={() => setCurrentView('messages-list')} className="w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer shadow-sm"></div><div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div><div className="w-3 h-3 rounded-full bg-[#28C840]"></div></div>
                             <div className="flex items-center gap-4">
                                <button onClick={(e) => handleToggleSeen(e, selectedMessage.id, selectedMessage.seen)} className={`text-[10px] font-black flex items-center gap-2 ${selectedMessage.seen ? 'text-blue-500' : 'text-gray-400'}`}>
                                  <i className={`fas ${selectedMessage.seen ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                  {selectedMessage.seen ? 'SEEN' : 'UNSEEN'}
                                </button>
                                <i onClick={() => setCurrentView('messages-list')} className="fas fa-times text-[12px] text-gray-400 cursor-pointer"></i>
                             </div>
                          </div>
                          <div className="p-10 space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5"><span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-1">Originator</span><span className="text-gray-900 dark:text-white font-black text-base">{selectedMessage.name}</span></div>
                               <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5"><span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-1">Email</span><span className="text-blue-600 font-black text-xs block truncate">{selectedMessage.email}</span></div>
                             </div>
                             <div className="p-8 min-h-[250px] text-gray-800 dark:text-gray-200 leading-[1.6] font-medium text-base whitespace-pre-wrap bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-black/5 shadow-inner">{selectedMessage.message}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/5 p-8 flex justify-between items-center border-t border-black/5">
                             <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal: ${selectedMessage.name}` })} className="px-6 py-3 rounded-xl text-red-500 text-[10px] font-black uppercase">Purge Signal</button>
                             <a href={`mailto:${selectedMessage.email}`} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]">Reply Channel</a>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="w-full max-w-[350px] glass-strong rounded-[2.5rem] border border-white dark:border-white/10 shadow-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-6 shadow-xl bg-red-600 text-white"><i className="fas fa-trash-alt"></i></div>
                  <h3 className="text-xl font-black mb-2">Confirm Purge</h3>
                  <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest">Permanent action required.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/10 text-[10px] font-black uppercase">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase shadow-xl shadow-red-500/20">Execute</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;