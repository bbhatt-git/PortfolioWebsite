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
    } catch (err) { setError('AUTH_FAILED: REJECTED'); }
  };

  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setCurrentView('message-viewer');
    
    // Mark as seen in database
    if (!msg.seen) {
      try {
        await updateDoc(doc(db, "messages", msg.id), { seen: true });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, seen: true } : m));
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
    } catch (err) { alert("Failed to commit."); }
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
    } catch (e) { alert("Purge failed."); }
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

  if (loading) return <div className="h-screen bg-[#F0F2F5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-10"></div>
      <div className="glass-strong p-10 rounded-[2rem] w-full max-w-sm shadow-2xl border border-white/40 text-center animate-scale-in z-10 backdrop-blur-3xl">
        <div className="w-14 h-14 bg-black rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 text-white font-black text-xl">BR</div>
        <h2 className="text-xs font-black mb-8 text-slate-800 dark:text-white uppercase tracking-[0.4em]">Control Center</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3.5 rounded-xl bg-slate-50 border border-transparent focus:border-blue-500/30 outline-none text-xs font-bold transition-all" />
          <input type="password" placeholder="Passcode" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3.5 rounded-xl bg-slate-50 border border-transparent focus:border-blue-500/30 outline-none text-xs font-bold transition-all" />
          <button className="w-full bg-black text-white font-black py-4 rounded-xl shadow-xl hover:bg-slate-900 transition-all text-[10px] uppercase tracking-widest">Login</button>
        </form>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center justify-between px-6 py-4 transition-all relative group ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {active && <div className="absolute inset-y-1.5 left-2 right-2 bg-blue-600 rounded-xl z-0 shadow-lg"></div>}
      <div className="flex items-center gap-4 z-10">
        <i className={`fas ${icon} text-sm w-4`}></i>
        <span className="hidden md:block text-[12px] font-bold tracking-tight">{label}</span>
      </div>
      {badge ? <span className="z-10 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-[#F0F2F5] dark:bg-[#080808] text-slate-900 dark:text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-16 md:w-64 bg-black flex flex-col shrink-0 z-50">
          <div className="p-8 pb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black text-xs">BR</div>
              <span className="hidden md:block font-black text-white text-[11px] tracking-widest uppercase">Bhupesh Console</span>
          </div>
          <nav className="flex-1">
              <SidebarItem icon="fa-th-large" label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-cubes" label="Repository" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Inquiries" view="messages-list" active={currentView === 'messages-list'} badge={unseenCount > 0 ? unseenCount : undefined} />
          </nav>
          <div className="p-6">
              <button onClick={() => signOut(auth)} className="w-full text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-left px-4">
                  Log Out
              </button>
          </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          <header className="h-16 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-8 shrink-0 z-40">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentView.replace('-', ' ')}</h2>
              <div className="flex items-center gap-4 border-l border-black/5 pl-6">
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 hidden sm:block">BHUPESH RAJ BHATT</span>
                  <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff&bold=true" className="w-8 h-8 rounded-xl" />
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="glass-strong p-6 rounded-2xl border border-white shadow-sm">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployments</p>
                             <p className="text-3xl font-black">{projects.length}</p>
                          </div>
                          <div className="glass-strong p-6 rounded-2xl border border-white shadow-sm">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inquiries</p>
                             <p className="text-3xl font-black">{messages.length}</p>
                          </div>
                          <div className="glass-strong p-6 rounded-2xl border border-white shadow-sm relative">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unseen</p>
                             <p className="text-3xl font-black text-blue-600">{unseenCount}</p>
                             {unseenCount > 0 && <span className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>}
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="glass-strong rounded-2xl border border-white shadow-lg overflow-hidden flex flex-col h-[500px]">
                             <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Repository</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-[10px] text-blue-600 font-black">View All</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {projects.slice(0, 10).map(p => (
                                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                        <img src={p.image} className="w-12 h-9 object-cover rounded-lg shadow-sm" />
                                        <div className="min-w-0">
                                            <p className="font-black text-[13px] truncate">{p.title}</p>
                                            <p className="text-[10px] text-slate-400 uppercase truncate">{p.stack}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>

                          <div className="glass-strong rounded-2xl border border-white shadow-lg overflow-hidden flex flex-col h-[500px]">
                             <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inquiries</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-[10px] text-blue-600 font-black">View All</button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5">
                                {messages.slice(0, 10).map((m) => (
                                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openMessage(m)}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs">{m.name[0]}</div>
                                                {!m.seen && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full"></span>}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black truncate w-40">{m.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{m.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                    </div>
                                ))}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECT EDITOR */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-4xl mx-auto pb-20">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                          <h1 className="text-xl font-black tracking-tighter">{editingProject ? 'Spec Update' : 'New Deployment'}</h1>
                          <div className="flex gap-3">
                              <button onClick={() => setCurrentView('projects-list')} className="px-5 py-2 rounded-xl border border-slate-300 text-[10px] font-black uppercase">Cancel</button>
                              <button onClick={handleSaveProject} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Commit</button>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <section className="glass-strong p-6 rounded-2xl border border-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5 md:col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metadata</p></div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Title</label>
                                  <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-xl outline-none text-sm font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Asset URL</label>
                                  <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-xl outline-none text-sm font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Live URL</label>
                                  <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-xl outline-none text-sm font-bold" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Code URL</label>
                                  <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-xl outline-none text-sm font-bold" />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Description</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-2.5 bg-slate-50 rounded-xl h-20 text-sm font-bold outline-none" />
                              </div>
                          </section>

                          <section className="glass-strong p-6 rounded-2xl border border-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
                               <div className="space-y-4">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tech Stack</p>
                                   <div className="flex gap-2">
                                      <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Add..." />
                                      <button onClick={() => { setTechStackList([...techStackList, techInput]); setTechInput(''); }} className="px-3 bg-slate-100 rounded-lg font-black">+</button>
                                   </div>
                                   <div className="flex flex-wrap gap-1.5">
                                       {techStackList.map(t => (
                                           <span key={t} className="px-2.5 py-1 bg-blue-50 text-[9px] font-black uppercase text-blue-600 rounded-md border border-blue-100 flex items-center gap-2">
                                               {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-400">×</button>
                                           </span>
                                       ))}
                                   </div>
                               </div>

                               <div className="space-y-4">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key Highlights</p>
                                   <div className="flex gap-2">
                                      <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Add Win..." />
                                      <button onClick={() => { setHighlightsList([...highlightsList, highlightInput]); setHighlightInput(''); }} className="px-3 bg-slate-100 rounded-lg font-black">+</button>
                                   </div>
                                   <div className="space-y-1.5">
                                       {highlightsList.map((h, i) => (
                                           <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 flex justify-between items-center group">
                                               <span>{h}</span>
                                               <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          </section>

                          <section className="glass-strong p-6 rounded-2xl border border-white shadow-sm space-y-6">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Narrative</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black text-red-500 uppercase">Challenge</label>
                                      <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full p-2 bg-slate-50 rounded-xl text-xs font-bold h-24 outline-none border border-transparent focus:ring-1 ring-red-500/20" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black text-green-600 uppercase">Solution</label>
                                      <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full p-2 bg-slate-50 rounded-xl text-xs font-bold h-24 outline-none border border-transparent focus:ring-1 ring-green-500/20" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black text-blue-600 uppercase">Results</label>
                                      <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full p-2 bg-slate-50 rounded-xl text-xs font-bold h-24 outline-none border border-transparent focus:ring-1 ring-blue-500/20" />
                                  </div>
                              </div>
                          </section>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECTS LIST */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-6xl mx-auto">
                      <div className="flex justify-between items-center mb-8">
                          <h1 className="text-xl font-black tracking-tighter">Repository Management</h1>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">New Record</button>
                      </div>
                      <div className="space-y-3">
                          {projects.map((p, idx) => (
                              <div 
                                key={p.id} 
                                draggable 
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                className={`glass-strong p-4 rounded-2xl border border-white shadow-sm flex items-center gap-6 transition-all group ${draggedItemIndex === idx ? 'opacity-40' : 'hover:-translate-y-0.5'}`}
                              >
                                  <div className="w-6 flex flex-col items-center gap-0.5 text-slate-300 cursor-grab active:cursor-grabbing">
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                  </div>
                                  <img src={p.image} className="w-14 h-10 object-cover rounded-xl shadow-sm" />
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-[14px] truncate">{p.title}</p>
                                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.stack}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <button onClick={() => navigateToEditor(p)} className="text-blue-500 p-2 hover:scale-110 transition-transform"><i className="fas fa-edit"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="text-red-500 p-2 hover:scale-110 transition-transform"><i className="fas fa-trash-alt"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-5xl mx-auto">
                      <h1 className="text-xl font-black tracking-tighter mb-8">Inbound Registry</h1>
                      <div className="glass-strong rounded-2xl border border-white shadow-lg overflow-hidden divide-y divide-black/5">
                          {messages.map(m => (
                              <div key={m.id} onClick={() => openMessage(m)} className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer group transition-all">
                                  <div className="flex items-center gap-5">
                                      <div className="relative">
                                          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xl">{m.name[0]}</div>
                                          {!m.seen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full"></span>}
                                      </div>
                                      <div>
                                          <h4 className="font-black text-slate-800 text-[15px] mb-0.5 group-hover:text-blue-600 transition-colors">{m.name}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.email}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-300 uppercase mb-0.5">Received</p>
                                      <p className="text-[11px] font-bold text-slate-400">{m.timestamp?.toDate().toLocaleString()}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGE VIEWER */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-4">
                      <div className="w-full max-w-2xl bg-black text-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
                          <div className="h-12 flex items-center px-6 justify-between border-b border-white/5 bg-white/5">
                             <div className="flex gap-2">
                               <div onClick={() => setCurrentView('messages-list')} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer"></div>
                               <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                               <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Signal Log</span>
                             <i onClick={() => setCurrentView('messages-list')} className="fas fa-times text-[10px] opacity-40 cursor-pointer"></i>
                          </div>
                          <div className="p-8 space-y-6">
                             <div className="flex items-center px-6 py-4 bg-white/5 rounded-xl border border-white/5">
                               <span className="text-slate-500 font-black w-20 text-[9px] uppercase">Sender:</span>
                               <span className="text-white font-black text-lg">{selectedMessage.name}</span>
                             </div>
                             <div className="flex items-center px-6 py-4 bg-white/5 rounded-xl border border-white/5">
                               <span className="text-slate-500 font-black w-20 text-[9px] uppercase">Origin:</span>
                               <span className="text-blue-500 font-black text-sm">{selectedMessage.email}</span>
                             </div>
                             <div className="p-8 min-h-[250px] text-slate-200 leading-[1.8] font-medium text-lg whitespace-pre-wrap bg-white/5 rounded-2xl border border-white/5">
                               {selectedMessage.message}
                             </div>
                          </div>
                          <div className="bg-white/5 p-8 flex justify-between items-center border-t border-white/5">
                             <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal from ${selectedMessage.name}` })} className="px-5 py-3 rounded-xl text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest">Delete</button>
                             <a href={`mailto:${selectedMessage.email}`} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Reply Message</a>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* MODAL */}
      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-8 animate-fade-in">
              <div className="w-full max-w-sm glass-strong rounded-[2rem] border border-white shadow-2xl animate-scale-in text-center p-10">
                  <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-6 ${deleteModal.type === 'project' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}><i className="fas fa-exclamation-triangle"></i></div>
                  <h3 className="text-xl font-black mb-2">Confirm Purge?</h3>
                  <p className="text-xs font-bold text-slate-500 mb-8 leading-relaxed"> Erasing <span className="text-slate-800 font-black">"{deleteModal.name}"</span>. Irreversible.</p>
                  <div className="flex gap-4">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-4 rounded-xl bg-slate-100 text-[10px] font-black uppercase">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-4 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase">Execute</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;