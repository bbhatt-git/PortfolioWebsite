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
  
  // Navigation
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Selection State
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; type: 'project' | 'message'; id: string; name: string } | null>(null);

  // Project Form State
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
    } catch (err) { setError('Access Denied: Protocol Violation'); }
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
    } catch (err) { alert("Deployment commit failed."); }
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
    } catch (e) {
      alert("Purge failed.");
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const reorderedProjects = [...projects];
    const [movedItem] = reorderedProjects.splice(draggedItemIndex, 1);
    reorderedProjects.splice(index, 0, movedItem);
    
    // Optimistic update
    setProjects(reorderedProjects);
    setDraggedItemIndex(null);

    // Persist new order to Firestore
    const batch = writeBatch(db);
    reorderedProjects.forEach((proj, idx) => {
      const ref = doc(db, "projects", proj.id);
      batch.update(ref, { order: idx });
    });
    await batch.commit();
  };

  if (loading) return (
    <div className="h-screen bg-[#F0F2F5] dark:bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[140px] animate-blob"></div>
      <div className="glass-strong p-12 rounded-[3rem] w-full max-w-sm shadow-2xl border border-white/60 text-center animate-scale-in z-10 backdrop-blur-3xl">
        <div className="w-16 h-16 bg-black rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-10 text-white font-black text-2xl">BR</div>
        <h2 className="text-sm font-black mb-10 text-slate-800 dark:text-white uppercase tracking-[0.5em]">Command Access</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Identifier" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/30 outline-none text-[11px] font-black uppercase tracking-widest transition-all" />
          <input type="password" placeholder="Key Phrase" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/30 outline-none text-[11px] font-black uppercase tracking-widest transition-all" />
          <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all text-[11px] uppercase tracking-[0.3em]">Authorize Link</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-8 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active }: { icon: string, label: string, view: AdminView, active: boolean }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center gap-5 px-8 py-5 transition-all relative group ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {active && <div className="absolute inset-y-2 left-3 right-3 bg-blue-600 rounded-2xl z-0 shadow-lg shadow-blue-600/30"></div>}
      <i className={`fas ${icon} text-sm w-5 z-10 group-hover:scale-110 transition-transform`}></i>
      <span className="hidden md:block text-[12px] font-black uppercase tracking-widest z-10">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-[#F0F2F5] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden">
      
      {/* SIDEBAR - Ultra Dark Minimal */}
      <aside className="w-16 md:w-72 bg-black flex flex-col shrink-0 z-50">
          <div className="p-8 pb-14 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">BR</div>
              <div className="hidden md:block">
                  <span className="block font-black text-white text-[12px] tracking-[0.3em] uppercase">Bhupesh Console</span>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Core System v2.5</span>
              </div>
          </div>
          <nav className="flex-1">
              <SidebarItem icon="fa-th-large" label="Overview" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-cubes" label="Repository" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Inquiries" view="messages-list" active={currentView === 'messages-list'} />
          </nav>
          <div className="p-6">
              <button onClick={() => signOut(auth)} className="w-full py-4 rounded-xl bg-white/5 text-slate-500 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                  <i className="fas fa-power-off"></i> <span className="hidden md:inline">Disconnect</span>
              </button>
          </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* HEADER */}
          <header className="h-20 bg-white/60 dark:bg-black/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-10 shrink-0 z-40">
              <div className="flex items-center gap-6">
                <i className="fas fa-bars text-slate-400 cursor-pointer hover:text-blue-500 transition-colors"></i>
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {currentView.replace('-', ' ')}
                </h2>
              </div>
              <div className="flex items-center gap-8">
                <div className="relative text-slate-400 group cursor-pointer">
                    <i className="fas fa-bell text-lg group-hover:text-blue-500 transition-colors"></i>
                    {messages.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full border border-white dark:border-black font-black">{messages.length}</span>}
                </div>
                <div className="flex items-center gap-4 pl-8 border-l border-black/5 dark:border-white/5">
                    <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff&bold=true" className="w-9 h-9 rounded-2xl shadow-xl" />
                    <div className="hidden sm:block">
                        <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none">SYSTEM.ROOT</p>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-1">Status: Active</p>
                    </div>
                </div>
              </div>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-10 bg-[#F0F2F5] dark:bg-[#050505] custom-scrollbar">
              
              {/* DASHBOARD: MINIMAL SIDE-BY-SIDE */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white shadow-xl">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Records</p>
                             <p className="text-4xl font-black">{projects.length}</p>
                          </div>
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white shadow-xl">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signals</p>
                             <p className="text-4xl font-black">{messages.length}</p>
                          </div>
                          <div className="glass-strong p-8 rounded-[2.5rem] border border-white shadow-xl md:col-span-2 flex items-center justify-between">
                             <div className="flex-1 mr-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Integrity</p>
                                <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                   <div className="w-[100%] h-full bg-blue-600"></div>
                                </div>
                             </div>
                             <span className="text-3xl font-black text-blue-600">100%</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* RECENT PROJECTS */}
                          <div className="glass-strong rounded-[3rem] border border-white shadow-2xl overflow-hidden flex flex-col h-[600px]">
                             <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white/20">
                                <h3 className="text-[11px] font-black text-slate-600 dark:text-white uppercase tracking-[0.3em]">Latest Deployments</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">Full System</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="divide-y divide-black/5">
                                    {projects.slice(0, 10).map(p => (
                                        <div key={p.id} className="p-6 flex items-center gap-6 hover:bg-white/40 transition-all cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                            <img src={p.image} className="w-16 h-12 object-cover rounded-2xl shadow-xl transition-transform group-hover:scale-105" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-base text-slate-800 dark:text-white truncate mb-1 group-hover:text-blue-600 transition-colors">{p.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{p.stack}</p>
                                            </div>
                                            <i className="fas fa-chevron-right text-[10px] text-slate-200"></i>
                                        </div>
                                    ))}
                                </div>
                                {projects.length === 0 && <div className="p-24 text-center text-slate-300 font-black text-[10px] uppercase tracking-[0.5em]">System Empty</div>}
                             </div>
                          </div>

                          {/* RECENT INQUIRIES */}
                          <div className="glass-strong rounded-[3rem] border border-white shadow-2xl overflow-hidden flex flex-col h-[600px]">
                             <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white/20">
                                <h3 className="text-[11px] font-black text-slate-600 dark:text-white uppercase tracking-[0.3em]">Signal Inbox</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">All Messages</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="divide-y divide-black/5">
                                    {messages.slice(0, 10).map((m) => (
                                        <div key={m.id} className="p-6 flex items-center justify-between hover:bg-white/40 transition-all cursor-pointer" onClick={() => { setSelectedMessage(m); setCurrentView('message-viewer'); }}>
                                            <div className="flex items-center gap-5">
                                                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-200 flex items-center justify-center font-black text-sm border border-black/5">{m.name[0]}</div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white truncate w-32 md:w-56">{m.name}</p>
                                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{m.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-md">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                                {messages.length === 0 && <div className="p-24 text-center text-slate-300 font-black text-[10px] uppercase tracking-[0.5em]">Clear Frequency</div>}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* PROJECT REPOSITORY: DRAGGABLE HIERARCHY */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-6xl mx-auto">
                      <div className="flex justify-between items-end mb-12">
                          <div>
                            <h2 className="text-4xl font-black tracking-tighter">Repository Management</h2>
                            <p className="text-sm text-slate-400 font-medium mt-1">Drag projects to reorder their display on the portfolio.</p>
                          </div>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all">New Deployment</button>
                      </div>
                      
                      <div className="space-y-4">
                          {projects.map((p, idx) => (
                              <div 
                                key={p.id} 
                                draggable 
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                className={`glass-strong p-5 rounded-[2rem] border border-white shadow-lg flex items-center gap-6 transition-all group ${draggedItemIndex === idx ? 'opacity-40 scale-95' : 'hover:-translate-y-1'}`}
                              >
                                  <div className="w-10 flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 transition-colors">
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                  </div>
                                  
                                  <img src={p.image} className="w-20 h-14 object-cover rounded-2xl shadow-xl" />
                                  
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-lg text-slate-800 dark:text-white truncate">{p.title}</p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.stack}</p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase">Order: {p.order}</span>
                                      <button onClick={() => navigateToEditor(p)} className="w-11 h-11 rounded-2xl bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="w-11 h-11 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                                  </div>
                              </div>
                          ))}
                          {projects.length === 0 && <div className="p-32 text-center text-slate-300 font-black text-[11px] uppercase tracking-[0.5em]">No Records Found</div>}
                      </div>
                  </div>
              )}

              {/* MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-5xl mx-auto">
                      <h1 className="text-4xl font-black tracking-tighter mb-12">Communications Registry</h1>
                      <div className="glass-strong rounded-[3rem] border border-white shadow-2xl overflow-hidden">
                          <div className="divide-y divide-black/5">
                              {messages.map(m => (
                                  <div key={m.id} onClick={() => { setSelectedMessage(m); setCurrentView('message-viewer'); }} className="p-8 flex items-center justify-between hover:bg-white/40 cursor-pointer group transition-all">
                                      <div className="flex items-center gap-8">
                                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-100 flex items-center justify-center font-black text-2xl border border-black/5 transition-transform group-hover:scale-110">{m.name[0]}</div>
                                          <div>
                                              <h4 className="font-black text-slate-800 dark:text-white text-xl leading-none mb-1 group-hover:text-blue-600 transition-colors">{m.name}</h4>
                                              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">{m.email}</p>
                                          </div>
                                      </div>
                                      <div className="text-right flex items-center gap-12">
                                          <div className="hidden sm:block">
                                              <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Received</p>
                                              <p className="text-xs font-bold text-slate-500">{m.timestamp?.toDate().toLocaleString()}</p>
                                          </div>
                                          <i className="fas fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-all"></i>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {messages.length === 0 && <div className="p-32 text-center text-slate-300 font-black text-[11px] uppercase tracking-[0.5em]">Inbox Clear</div>}
                      </div>
                  </div>
              )}

              {/* PROJECT EDITOR */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-5xl mx-auto pb-32">
                      <div className="flex items-center justify-between mb-12 pb-8 border-b border-black/5">
                          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{editingProject ? 'Update Specs' : 'New Deployment'}</h1>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('projects-list')} className="px-8 py-3 rounded-2xl border border-slate-300 text-slate-500 text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
                              <button onClick={handleSaveProject} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all">Commit Changes</button>
                          </div>
                      </div>

                      <div className="space-y-12">
                          {/* 01. Metadata */}
                          <section className="glass-strong p-10 rounded-[3rem] border border-white shadow-2xl space-y-8">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">01. System Specifications</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Project Name</label>
                                      <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="Title..." />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Asset URL</label>
                                      <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="https://..." />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Live Preview</label>
                                      <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="https://..." />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Source Repo</label>
                                      <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="https://github.com/..." />
                                  </div>
                              </div>
                              <div className="space-y-3 pt-4">
                                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Summary Brief</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] h-32 font-bold text-sm outline-none focus:ring-4 ring-blue-500/5 transition-all" placeholder="Project overview..." />
                              </div>
                          </section>

                          {/* 02. Tech Arsenal */}
                          <section className="glass-strong p-10 rounded-[3rem] border border-white shadow-2xl">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">02. Technical Environment</p>
                               <div className="space-y-6">
                                   <div className="flex gap-4">
                                      <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 font-bold text-sm" placeholder="Enter tech (e.g., React)..." />
                                      <button onClick={() => { setTechStackList([...techStackList, techInput]); setTechInput(''); }} className="w-16 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all">+</button>
                                   </div>
                                   <div className="flex flex-wrap gap-2 mt-6">
                                       {techStackList.map(t => (
                                           <span key={t} className="px-5 py-2.5 bg-blue-600/10 text-blue-600 border border-blue-500/20 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-4">
                                               {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-500 hover:scale-125 transition-transform">×</button>
                                           </span>
                                       ))}
                                   </div>
                               </div>
                          </section>

                          {/* 03. KEY HIGHLIGHTS SECTION */}
                          <section className="glass-strong p-10 rounded-[3rem] border border-white shadow-2xl">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">03. Performance Metrics & Highlights</p>
                               <div className="space-y-6">
                                   <div className="flex gap-4">
                                      <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="flex-1 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 font-bold text-sm" placeholder="Add specific win (e.g., 40% performance boost)..." />
                                      <button onClick={() => { setHighlightsList([...highlightsList, highlightInput]); setHighlightInput(''); }} className="w-16 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all">+</button>
                                   </div>
                                   <div className="space-y-3 mt-6">
                                       {highlightsList.map((h, i) => (
                                           <div key={i} className="p-5 bg-slate-50 dark:bg-white/5 border border-black/5 rounded-2xl flex justify-between items-center group">
                                               <span className="text-[12px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{h}</span>
                                               <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-black">PURGE</button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          </section>

                          {/* 04. Case Study Narrative */}
                          <section className="glass-strong p-10 rounded-[3rem] border border-white shadow-2xl space-y-10">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">04. Project Narrative</p>
                              <div className="space-y-8">
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em]">The Challenge</label>
                                      <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full p-5 bg-red-500/5 rounded-[2rem] text-sm font-bold leading-relaxed h-32 outline-none border border-transparent focus:ring-4 ring-red-500/5 transition-all" />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-green-600 uppercase tracking-[0.2em]">The Solution</label>
                                      <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full p-5 bg-green-500/5 rounded-[2rem] text-sm font-bold leading-relaxed h-32 outline-none border border-transparent focus:ring-4 ring-green-500/5 transition-all" />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">The Results</label>
                                      <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full p-5 bg-blue-500/5 rounded-[2rem] text-sm font-bold leading-relaxed h-32 outline-none border border-transparent focus:ring-4 ring-blue-500/5 transition-all" />
                                  </div>
                              </div>
                          </section>
                      </div>
                  </div>
              )}

              {/* MESSAGE VIEWER */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-8">
                      <div className="w-full max-w-3xl glass-strong text-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 flex flex-col relative animate-scale-in">
                          <div className="bg-black h-16 flex items-center px-8 justify-between border-b border-white/5 relative shrink-0">
                             <div className="flex gap-2">
                               <div onClick={() => setCurrentView('messages-list')} className="w-4 h-4 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:scale-110 transition-transform"></div>
                               <div className="w-4 h-4 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                               <div className="w-4 h-4 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                             </div>
                             <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-60">
                                <i className="fas fa-satellite-dish text-[11px] text-blue-400"></i>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Received</span>
                             </div>
                             <i onClick={() => setCurrentView('messages-list')} className="fas fa-reply text-xs opacity-40 cursor-pointer hover:opacity-100 transition-opacity"></i>
                          </div>
                          <div className="p-10 space-y-6">
                             <div className="flex items-center px-8 py-5 border-b border-white/5 bg-white/5 rounded-2xl">
                               <span className="text-slate-400 font-black w-24 text-[10px] uppercase tracking-widest">Sender:</span>
                               <span className="text-white font-black text-xl">{selectedMessage.name}</span>
                             </div>
                             <div className="flex items-center px-8 py-5 border-b border-white/5 bg-white/5 rounded-2xl">
                               <span className="text-slate-400 font-black w-24 text-[10px] uppercase tracking-widest">Protocol:</span>
                               <span className="text-blue-500 font-black text-base tracking-tight">{selectedMessage.email}</span>
                             </div>
                             <div className="p-10 min-h-[350px] text-slate-200 leading-[2] font-medium text-lg whitespace-pre-wrap bg-white/5 rounded-[2rem]">
                               {selectedMessage.message}
                             </div>
                          </div>
                          <div className="bg-white/5 p-10 flex justify-between items-center border-t border-white/5">
                             <div></div>
                             <div className="flex gap-6">
                                <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal from ${selectedMessage.name}` })} className="px-8 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all text-[11px] font-black uppercase tracking-widest">Purge Signal</button>
                                <a href={`mailto:${selectedMessage.email}`} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-widest"><i className="fas fa-paper-plane"></i> Reply Frequency</a>
                             </div>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* CUSTOM PURGE CONFIRMATION MODAL */}
      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-8 animate-fade-in">
              <div className="w-full max-w-md glass-strong rounded-[3rem] border border-white/20 overflow-hidden shadow-2xl animate-scale-in text-center p-14">
                  <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center text-4xl mb-10 shadow-2xl ${deleteModal.type === 'project' ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-slate-900 text-white'}`}>
                      <i className={deleteModal.type === 'project' ? 'fas fa-radiation' : 'fas fa-trash-alt'}></i>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter mb-4 text-slate-800 dark:text-white">Confirm System Purge?</h3>
                  <p className="text-sm font-bold text-slate-500 mb-12 leading-relaxed">
                      You are about to permanently erase <span className="text-slate-800 dark:text-white font-black">"{deleteModal.name}"</span>. This operation is irrevocable.
                  </p>
                  <div className="flex gap-5">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-red-600/20 hover:bg-red-500 transition-all">Execute Purge</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Admin;