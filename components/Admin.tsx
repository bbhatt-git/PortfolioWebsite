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
  
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; type: 'project' | 'message'; id: string; name: string } | null>(null);

  // Form State
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
  const [caseStudyForm, setCaseStudyForm] = useState({ challenge: '', solution: '', results: '' });
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
    setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchProjects = async () => {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) { setError('AUTH_ERR: REJECTED'); }
  };

  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setCurrentView('message-viewer');
    
    // Immediate local update for seen status
    if (!msg.seen) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, seen: true } : m));
      try {
        await updateDoc(doc(db, "messages", msg.id), { seen: true });
      } catch (err) { console.error("Update seen failed", err); }
    }
  };

  const navigateToEditor = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({ title: proj.title, desc: proj.desc, liveUrl: proj.liveUrl || '', codeUrl: proj.codeUrl || '', imageUrl: proj.image });
      setCaseStudyForm({ challenge: proj.caseStudy?.challenge || '', solution: proj.caseStudy?.solution || '', results: proj.caseStudy?.results || '' });
      setTechStackList(proj.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean));
      setHighlightsList(proj.highlights || []);
    } else {
      setEditingProject(null);
      setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
      setCaseStudyForm({ challenge: '', solution: '', results: '' });
      setTechStackList([]);
      setHighlightsList([]);
    }
    setCurrentView('project-editor');
  };

  const handleSaveProject = async () => {
    if (!projectForm.title) return alert("System requires a title.");
    const data = {
      ...projectForm,
      image: projectForm.imageUrl || 'https://via.placeholder.com/1200x800',
      stack: techStackList.join(' • '),
      highlights: highlightsList,
      caseStudy: caseStudyForm,
      order: editingProject ? editingProject.order : projects.length
    };
    try {
      if (editingProject) await updateDoc(doc(db, "projects", editingProject.id), data);
      else await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
      fetchProjects();
      setCurrentView('projects-list');
    } catch (err) { alert("Failed to save."); }
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

  if (loading) return <div className="h-screen bg-slate-50 dark:bg-black flex items-center justify-center"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-[#050505] p-6 relative overflow-hidden">
      <div className="w-full max-w-sm glass-strong p-8 rounded-3xl border border-white/40 text-center z-10 shadow-2xl">
        <div className="w-12 h-12 bg-black rounded-2xl mx-auto flex items-center justify-center mb-6 text-white font-black text-lg">BR</div>
        <h2 className="text-[10px] font-black mb-8 text-slate-500 uppercase tracking-[0.4em]">Control Port</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="email" placeholder="Identifier" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:border-blue-500/20 outline-none text-xs font-bold transition-all" />
          <input type="password" placeholder="Credential" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:border-blue-500/20 outline-none text-xs font-bold transition-all" />
          <button className="w-full bg-black dark:bg-white dark:text-black text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest hover:opacity-90 transition-all">Authorize</button>
        </form>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center justify-between px-6 py-3.5 transition-all relative group ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {active && <div className="absolute inset-y-1.5 left-2 right-2 bg-blue-600 rounded-xl z-0 shadow-lg"></div>}
      <div className="flex items-center gap-3.5 z-10">
        <i className={`fas ${icon} text-xs w-4`}></i>
        <span className="hidden md:block text-[11px] font-bold tracking-tight uppercase tracking-widest">{label}</span>
      </div>
      {badge ? <span className="z-10 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px]">{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden">
      
      {/* SIDEBAR - Tightened */}
      <aside className="w-16 md:w-60 bg-black flex flex-col shrink-0 z-50">
          <div className="p-6 pb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">BR</div>
              <span className="hidden md:block font-black text-white text-[10px] tracking-widest uppercase">Admin.Core</span>
          </div>
          <nav className="flex-1">
              <SidebarItem icon="fa-th-large" label="Status" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-cubes" label="Registry" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Signals" view="messages-list" active={currentView === 'messages-list'} badge={unseenCount > 0 ? unseenCount : undefined} />
          </nav>
          <div className="p-6">
              <button onClick={() => signOut(auth)} className="w-full text-slate-500 hover:text-red-400 transition-all text-[9px] font-black uppercase tracking-widest px-2">
                  Disconnect
              </button>
          </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          <header className="h-14 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-40">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentView.replace('-', ' ')}</h2>
              <div className="flex items-center gap-6">
                  {/* Notification Dot in Header - Only shows unread count */}
                  <div className="relative group cursor-pointer" onClick={() => setCurrentView('messages-list')}>
                      <i className="fas fa-bell text-slate-400 text-sm group-hover:text-blue-500 transition-colors"></i>
                      {unseenCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white dark:border-black font-black">
                          {unseenCount}
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-3 border-l border-slate-100 dark:border-white/5 pl-6">
                      <span className="text-[10px] font-black text-slate-500 hidden sm:block">ROOT_ACCESS</span>
                      <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff&bold=true" className="w-7 h-7 rounded-lg" />
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              
              {/* DASHBOARD: MINIMAL METRICS */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="glass-strong p-6 rounded-2xl border border-white/40">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Assets</p>
                             <p className="text-2xl font-black">{projects.length}</p>
                          </div>
                          <div className="glass-strong p-6 rounded-2xl border border-white/40">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Signals</p>
                             <p className="text-2xl font-black">{messages.length}</p>
                          </div>
                          <div className="glass-strong p-6 rounded-2xl border border-white/40">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unread Queue</p>
                             <p className={`text-2xl font-black ${unseenCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>{unseenCount}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* RECENT REPOSITORY */}
                          <div className="glass-strong rounded-2xl border border-white/40 overflow-hidden flex flex-col h-[450px]">
                             <div className="px-5 py-3 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Latest Deployments</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-[9px] text-blue-600 font-black">Manage All</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {projects.slice(0, 10).map(p => (
                                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                        <img src={p.image} className="w-10 h-7 object-cover rounded-md shadow-sm" />
                                        <div className="min-w-0">
                                            <p className="font-black text-xs truncate group-hover:text-blue-600 transition-colors">{p.title}</p>
                                            <p className="text-[8px] text-slate-400 uppercase truncate">{p.stack}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>

                          {/* RECENT SIGNALS */}
                          <div className="glass-strong rounded-2xl border border-white/40 overflow-hidden flex flex-col h-[450px]">
                             <div className="px-5 py-3 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Incoming Traffic</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-[9px] text-blue-600 font-black">View Inbox</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {messages.slice(0, 10).map((m) => (
                                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openMessage(m)}>
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-[10px]">{m.name[0]}</div>
                                                {!m.seen && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 border border-white dark:border-black rounded-full"></span>}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-black truncate">{m.name}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{m.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                    </div>
                                ))}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* REGISTRY LIST (PROJECTS) */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-5xl mx-auto">
                      <div className="flex justify-between items-center mb-6">
                          <h1 className="text-lg font-black tracking-tighter uppercase tracking-[0.2em]">Asset Registry</h1>
                          <button onClick={() => navigateToEditor()} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Deploy New</button>
                      </div>
                      <div className="space-y-2">
                          {projects.map((p, idx) => (
                              <div 
                                key={p.id} 
                                draggable 
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                className={`glass-strong p-3.5 rounded-2xl border border-white/40 shadow-sm flex items-center gap-5 transition-all group ${draggedItemIndex === idx ? 'opacity-30' : 'hover:scale-[1.005]'}`}
                              >
                                  <div className="w-4 flex flex-col items-center gap-0.5 text-slate-200 cursor-grab active:cursor-grabbing">
                                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                                  </div>
                                  <img src={p.image} className="w-12 h-9 object-cover rounded-lg shadow-sm" />
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-sm truncate">{p.title}</p>
                                      <p className="text-[9px] text-slate-400 uppercase tracking-widest">{p.stack}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <button onClick={() => navigateToEditor(p)} className="text-blue-500 w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-white/5 transition-colors"><i className="fas fa-edit text-xs"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="text-red-500 w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-white/5 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* INBOUND REGISTRY (MESSAGES) */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-4xl mx-auto">
                      <h1 className="text-lg font-black tracking-tighter mb-6 uppercase tracking-[0.2em]">Signal Inbox</h1>
                      <div className="glass-strong rounded-2xl border border-white/40 overflow-hidden divide-y divide-black/5">
                          {messages.map(m => (
                              <div key={m.id} onClick={() => openMessage(m)} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="relative">
                                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center font-black text-sm">{m.name[0]}</div>
                                          {!m.seen && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 border-2 border-white dark:border-black rounded-full shadow-lg"></span>}
                                      </div>
                                      <div>
                                          <h4 className={`font-black text-sm transition-colors ${!m.seen ? 'text-blue-600' : 'text-slate-800 dark:text-slate-200'} group-hover:text-blue-500`}>{m.name}</h4>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{m.email}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Logged</p>
                                      <p className="text-[10px] font-bold text-slate-400">{m.timestamp?.toDate().toLocaleDateString()}</p>
                                  </div>
                              </div>
                          ))}
                          {messages.length === 0 && <div className="p-16 text-center text-slate-300 font-black uppercase text-[9px] tracking-widest">Inbox Empty</div>}
                      </div>
                  </div>
              )}

              {/* PROJECT EDITOR - Tighter */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-4xl mx-auto pb-16">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                          <h1 className="text-lg font-black tracking-tighter uppercase tracking-widest">{editingProject ? 'Spec Revision' : 'New Deployment'}</h1>
                          <div className="flex gap-2">
                              <button onClick={() => setCurrentView('projects-list')} className="px-4 py-2 rounded-lg border border-slate-300 text-[9px] font-black uppercase tracking-widest">Discard</button>
                              <button onClick={handleSaveProject} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Sync Changes</button>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <section className="glass-strong p-6 rounded-2xl border border-white/40 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-1.5 md:col-span-2"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">01. Identity & Routing</p></div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                                  <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Thumbnail URL</label>
                                  <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Terminal</label>
                                  <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Source Repo</label>
                                  <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brief Narrative</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-white/5 rounded-xl h-20 text-xs font-bold outline-none" />
                              </div>
                          </section>

                          <section className="glass-strong p-6 rounded-2xl border border-white/40 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-3">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">02. Tech Arsenal</p>
                                   <div className="flex gap-2">
                                      <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-2 bg-slate-100 dark:bg-white/5 border-transparent rounded-lg text-xs font-bold" placeholder="Add Tool..." />
                                      <button onClick={() => { setTechStackList([...techStackList, techInput]); setTechInput(''); }} className="px-3 bg-slate-200 dark:bg-white/10 rounded-lg font-black text-sm">+</button>
                                   </div>
                                   <div className="flex flex-wrap gap-1.5">
                                       {techStackList.map(t => (
                                           <span key={t} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-600/10 text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900 flex items-center gap-2">
                                               {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-400">×</button>
                                           </span>
                                       ))}
                                   </div>
                               </div>

                               <div className="space-y-3">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">03. Key Metrics</p>
                                   <div className="flex gap-2">
                                      <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="flex-1 p-2 bg-slate-100 dark:bg-white/5 border-transparent rounded-lg text-xs font-bold" placeholder="Add Metric..." />
                                      <button onClick={() => { setHighlightsList([...highlightsList, highlightInput]); setHighlightInput(''); }} className="px-3 bg-slate-200 dark:bg-white/10 rounded-lg font-black text-sm">+</button>
                                   </div>
                                   <div className="space-y-1">
                                       {highlightsList.map((h, i) => (
                                           <div key={i} className="p-2 bg-slate-50 dark:bg-white/5 border border-black/5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 flex justify-between items-center group">
                                               <span>{h}</span>
                                               <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          </section>
                      </div>
                  </div>
              )}

              {/* SIGNAL VIEWER (MESSAGE) - Extreme Minimalism */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-2">
                      <div className="w-full max-w-2xl bg-black dark:bg-[#0c0c0c] text-white rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-scale-in border border-white/10">
                          <div className="h-10 flex items-center px-5 justify-between bg-white/5">
                             <div className="flex gap-1.5">
                               <div onClick={() => setCurrentView('messages-list')} className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] cursor-pointer"></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Inbound Log</span>
                             <i onClick={() => setCurrentView('messages-list')} className="fas fa-times text-[10px] opacity-30 cursor-pointer hover:opacity-100"></i>
                          </div>
                          <div className="p-6 md:p-8 space-y-4">
                             <div className="flex items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                               <span className="text-slate-500 font-black w-16 text-[8px] uppercase tracking-widest">From:</span>
                               <span className="text-white font-black text-sm">{selectedMessage.name}</span>
                             </div>
                             <div className="flex items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                               <span className="text-slate-500 font-black w-16 text-[8px] uppercase tracking-widest">Link:</span>
                               <span className="text-blue-500 font-black text-xs break-all">{selectedMessage.email}</span>
                             </div>
                             <div className="p-6 min-h-[200px] text-slate-300 leading-relaxed font-medium text-sm whitespace-pre-wrap bg-white/5 rounded-xl border border-white/5">
                               {selectedMessage.message}
                             </div>
                          </div>
                          <div className="bg-white/5 p-6 flex justify-between items-center">
                             <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal: ${selectedMessage.name}` })} className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 text-[8px] font-black uppercase tracking-widest">Purge</button>
                             <a href={`mailto:${selectedMessage.email}`} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-xl shadow-blue-600/20">Reply Signal</a>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* PURGE CONFIRMATION MODAL */}
      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
              <div className="w-full max-w-xs glass-strong rounded-3xl border border-white shadow-2xl animate-scale-in text-center p-8">
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-xl mb-6 ${deleteModal.type === 'project' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}><i className="fas fa-trash-alt"></i></div>
                  <h3 className="text-lg font-black mb-2 tracking-tighter">Confirm Purge</h3>
                  <p className="text-[10px] font-bold text-slate-500 mb-8 leading-relaxed uppercase tracking-widest">Permanently erasing entry.<br/>Operation irreversible.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">Execute</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;