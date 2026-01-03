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
    } catch (err) { setError('Access Denied'); }
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
    
    // Immediate local update for seen status to clear notifications instantly
    if (!msg.seen) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, seen: true } : m));
      try {
        await updateDoc(doc(db, "messages", msg.id), { seen: true });
      } catch (err) { 
        console.error("Update seen failed", err); 
      }
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
    if (!projectForm.title) return alert("Title required.");
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

  if (loading) return <div className="h-screen bg-slate-50 dark:bg-black flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-[#050505] p-4 relative overflow-hidden transition-colors duration-700">
      <div className="w-full max-w-sm glass-strong p-8 rounded-3xl border border-white/20 text-center z-10 shadow-2xl">
        <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl mx-auto flex items-center justify-center mb-6 font-black text-lg">BR</div>
        <h2 className="text-[10px] font-black mb-8 text-slate-500 uppercase tracking-[0.4em]">Control Port</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="email" placeholder="Identifier" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:border-primary outline-none text-xs font-bold transition-all" />
          <input type="password" placeholder="Credential" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:border-primary outline-none text-xs font-bold transition-all" />
          <button className="w-full bg-black dark:bg-white dark:text-black text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest hover:opacity-90 transition-all">Authorize</button>
        </form>
        {error && <p className="mt-4 text-[10px] text-red-500 font-bold uppercase">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center justify-between px-6 py-3 transition-all relative group ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {active && <div className="absolute inset-y-1 left-2 right-2 bg-primary rounded-lg z-0"></div>}
      <div className="flex items-center gap-3.5 z-10">
        <i className={`fas ${icon} text-xs w-4`}></i>
        <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {badge ? <span className="z-10 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px]">{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-700">
      
      {/* SIDEBAR */}
      <aside className="w-16 md:w-56 bg-black flex flex-col shrink-0 z-50">
          <div className="p-6 pb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">BR</div>
              <span className="hidden md:block font-black text-white text-[9px] tracking-widest uppercase">Admin.v2</span>
          </div>
          <nav className="flex-1">
              <SidebarItem icon="fa-chart-pie" label="Status" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-database" label="Assets" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-inbox" label="Signals" view="messages-list" active={currentView === 'messages-list'} badge={unseenCount > 0 ? unseenCount : undefined} />
          </nav>
          <div className="p-6">
              <button onClick={() => signOut(auth)} className="w-full text-slate-500 hover:text-red-400 transition-all text-[8px] font-black uppercase tracking-widest px-2">
                  Disconnect
              </button>
          </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          <header className="h-12 bg-white dark:bg-black/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-40 transition-colors">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{currentView.replace('-', ' ')}</h2>
              <div className="flex items-center gap-5">
                  {/* Theme Toggle Added */}
                  <button onClick={toggleTheme} className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                    <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
                  </button>
                  
                  <div className="relative group cursor-pointer" onClick={() => setCurrentView('messages-list')}>
                      <i className="fas fa-bell text-slate-400 text-sm group-hover:text-primary transition-colors"></i>
                      {unseenCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-black font-black">
                          {unseenCount}
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-100 dark:border-white/5 pl-5">
                      <img src="https://ui-avatars.com/api/?name=B&background=2563EB&color=fff&bold=true" className="w-6 h-6 rounded-md shadow-sm" />
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-5xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="glass-strong p-5 rounded-2xl border border-white dark:border-white/5 shadow-sm">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Records</p>
                             <p className="text-xl font-black">{projects.length}</p>
                          </div>
                          <div className="glass-strong p-5 rounded-2xl border border-white dark:border-white/5 shadow-sm">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Signals</p>
                             <p className="text-xl font-black">{messages.length}</p>
                          </div>
                          <div className="glass-strong p-5 rounded-2xl border border-white dark:border-white/5 shadow-sm">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unread</p>
                             <p className={`text-xl font-black ${unseenCount > 0 ? 'text-primary' : 'text-slate-400'}`}>{unseenCount}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="glass-strong rounded-2xl border border-white dark:border-white/5 overflow-hidden flex flex-col h-[400px] shadow-sm">
                             <div className="px-4 py-3 border-b border-black/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Repository</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-[9px] text-primary font-black uppercase">View</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {projects.slice(0, 8).map(p => (
                                    <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                        <img src={p.image} className="w-8 h-6 object-cover rounded shadow-sm" />
                                        <div className="min-w-0">
                                            <p className="font-black text-[12px] truncate group-hover:text-primary transition-colors text-slate-800 dark:text-slate-200">{p.title}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>

                          <div className="glass-strong rounded-2xl border border-white dark:border-white/5 overflow-hidden flex flex-col h-[400px] shadow-sm">
                             <div className="px-4 py-3 border-b border-black/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Signals</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-[9px] text-primary font-black uppercase">View</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {messages.slice(0, 8).map((m) => (
                                    <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openMessage(m)}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="w-7 h-7 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-[10px] text-slate-600 dark:text-slate-300">{m.name[0]}</div>
                                                {!m.seen && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary border border-white dark:border-black rounded-full"></span>}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-[12px] font-black truncate text-slate-800 dark:text-slate-200">{m.name}</p>
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

              {/* VIEW: PROJECTS LIST */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-4xl mx-auto">
                      <div className="flex justify-between items-center mb-5">
                          <h1 className="text-sm font-black tracking-widest uppercase text-slate-700 dark:text-slate-300">Repository</h1>
                          <button onClick={() => navigateToEditor()} className="bg-primary text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">New Record</button>
                      </div>
                      <div className="space-y-2">
                          {projects.map((p, idx) => (
                              <div 
                                key={p.id} 
                                draggable 
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                className={`glass-strong p-3 rounded-xl border border-white dark:border-white/5 shadow-sm flex items-center gap-4 transition-all group ${draggedItemIndex === idx ? 'opacity-30' : 'hover:bg-white dark:hover:bg-slate-900'}`}
                              >
                                  <div className="w-4 flex flex-col items-center gap-0.5 text-slate-300 cursor-grab active:cursor-grabbing">
                                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                                      <div className="w-0.5 h-0.5 bg-current rounded-full"></div>
                                  </div>
                                  <img src={p.image} className="w-10 h-7 object-cover rounded-md shadow-sm" />
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-xs truncate text-slate-800 dark:text-slate-200">{p.title}</p>
                                      <p className="text-[8px] text-slate-400 uppercase tracking-widest">{p.stack}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <button onClick={() => navigateToEditor(p)} className="text-primary w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><i className="fas fa-edit text-[10px]"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="text-red-500 w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-4xl mx-auto">
                      <h1 className="text-sm font-black tracking-widest mb-5 uppercase text-slate-700 dark:text-slate-300">Incoming Signals</h1>
                      <div className="glass-strong rounded-xl border border-white dark:border-white/5 overflow-hidden divide-y divide-black/5 shadow-sm">
                          {messages.map(m => (
                              <div key={m.id} onClick={() => openMessage(m)} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="relative">
                                          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center font-black text-xs">{m.name[0]}</div>
                                          {!m.seen && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white dark:border-black rounded-full shadow-lg"></span>}
                                      </div>
                                      <div>
                                          <h4 className={`font-black text-[13px] transition-colors ${!m.seen ? 'text-primary' : 'text-slate-800 dark:text-slate-300'} group-hover:text-primary`}>{m.name}</h4>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{m.email}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Logged</p>
                                      <p className="text-[9px] font-bold text-slate-400">{m.timestamp?.toDate().toLocaleDateString()}</p>
                                  </div>
                              </div>
                          ))}
                          {messages.length === 0 && <div className="p-12 text-center text-slate-300 font-black uppercase text-[9px] tracking-widest">Inbox Empty</div>}
                      </div>
                  </div>
              )}

              {/* PROJECT EDITOR */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-4xl mx-auto pb-12">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                          <h1 className="text-sm font-black tracking-widest uppercase">{editingProject ? 'Spec Update' : 'New Deployment'}</h1>
                          <div className="flex gap-2">
                              <button onClick={() => setCurrentView('projects-list')} className="px-3 py-1.5 rounded-lg border border-slate-300 text-[9px] font-black uppercase">Discard</button>
                              <button onClick={handleSaveProject} className="px-4 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase shadow-md">Sync</button>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <section className="glass-strong p-5 rounded-2xl border border-white dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1 md:col-span-2"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Metadata</p></div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase">Title</label>
                                  <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase">Thumbnail URL</label>
                                  <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase">Live URL</label>
                                  <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-500 uppercase">Source Repo</label>
                                  <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none text-xs font-bold" />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                  <label className="text-[9px] font-black text-slate-500 uppercase">Description</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg h-20 text-xs font-bold outline-none" />
                              </div>
                          </section>

                          <section className="glass-strong p-5 rounded-2xl border border-white dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-3">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tech Arsenal</p>
                                   <div className="flex gap-2">
                                      <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold" placeholder="Add Tool..." />
                                      <button onClick={() => { if(techInput) {setTechStackList([...techStackList, techInput]); setTechInput('');} }} className="px-2.5 bg-primary text-white rounded-lg font-black text-sm">+</button>
                                   </div>
                                   <div className="flex flex-wrap gap-1">
                                       {techStackList.map(t => (
                                           <span key={t} className="px-2 py-0.5 bg-primary/10 text-[8px] font-black uppercase text-primary rounded-md border border-primary/20 flex items-center gap-2">
                                               {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-400 hover:text-red-600 transition-colors">×</button>
                                           </span>
                                       ))}
                                   </div>
                               </div>

                               <div className="space-y-3">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Highlights</p>
                                   <div className="flex gap-2">
                                      <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="flex-1 p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold" placeholder="Add Metric..." />
                                      <button onClick={() => { if(highlightInput) {setHighlightsList([...highlightsList, highlightInput]); setHighlightInput('');} }} className="px-2.5 bg-primary text-white rounded-lg font-black text-sm">+</button>
                                   </div>
                                   <div className="space-y-1">
                                       {highlightsList.map((h, i) => (
                                           <div key={i} className="p-1.5 bg-slate-50 dark:bg-white/5 border border-black/5 rounded-lg text-[9px] font-bold text-slate-500 flex justify-between items-center group">
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

              {/* VIEW: MESSAGE VIEWER */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-2">
                      <div className="w-full max-w-xl glass-strong rounded-2xl shadow-xl overflow-hidden flex flex-col relative animate-scale-in border border-white dark:border-white/5">
                          <div className="h-10 flex items-center px-4 justify-between bg-black/5 dark:bg-white/5">
                             <div className="flex gap-1.5">
                               <div onClick={() => setCurrentView('messages-list')} className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] cursor-pointer"></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Signal Log</span>
                             <i onClick={() => setCurrentView('messages-list')} className="fas fa-times text-[10px] text-slate-400 cursor-pointer"></i>
                          </div>
                          <div className="p-6 space-y-4">
                             <div className="flex items-center px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-black/5">
                               <span className="text-slate-400 font-black w-14 text-[8px] uppercase">From:</span>
                               <span className="text-slate-800 dark:text-white font-black text-sm">{selectedMessage.name}</span>
                             </div>
                             <div className="flex items-center px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-black/5">
                               <span className="text-slate-400 font-black w-14 text-[8px] uppercase">Origin:</span>
                               <span className="text-primary font-black text-xs">{selectedMessage.email}</span>
                             </div>
                             <div className="p-5 min-h-[150px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm whitespace-pre-wrap bg-slate-50 dark:bg-white/5 rounded-lg border border-black/5">
                               {selectedMessage.message}
                             </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/5 p-4 flex justify-between items-center">
                             <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal: ${selectedMessage.name}` })} className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 text-[8px] font-black uppercase">Purge</button>
                             <a href={`mailto:${selectedMessage.email}`} className="bg-primary text-white px-5 py-2 rounded-lg font-black text-[9px] uppercase shadow-lg shadow-primary/20">Reply Signal</a>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* PURGE CONFIRMATION MODAL */}
      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-xs glass-strong rounded-2xl border border-white dark:border-white/10 shadow-2xl animate-scale-in text-center p-8">
                  <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-xl mb-5 ${deleteModal.type === 'project' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}><i className="fas fa-trash-alt"></i></div>
                  <h3 className="text-base font-black mb-1">Confirm Purge</h3>
                  <p className="text-[9px] font-bold text-slate-500 mb-6 uppercase tracking-widest">Irreversible operation.</p>
                  <div className="flex gap-2">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-[9px] font-black uppercase">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase">Execute</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;