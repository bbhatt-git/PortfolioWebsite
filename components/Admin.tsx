import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import { Project } from '../types';
import { sanitizeInput } from '../utils/security';

type AdminView = 'dashboard' | 'new-project' | 'projects-list' | 'messages' | 'message-viewer';

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

  useEffect(() => {
    if (deleteModal && deleteModal.show) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [deleteModal]);

  const fetchMessages = async () => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    setMessages(snap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      seen: doc.data().seen === true 
    })));
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
      // Inputs are handled by Firebase SDK which is secure against simple Auth bypass
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) { 
      setError(err.message || 'Access Denied'); 
    }
  };

  const updateMessageSeenStatus = async (msgId: string, status: boolean) => {
    try {
      const msgRef = doc(db, "messages", msgId);
      await updateDoc(msgRef, { seen: status });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, seen: status } : m));
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(prev => ({ ...prev, seen: status }));
      }
    } catch (err) {
      console.error("Firestore update failed", err);
    }
  };

  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setCurrentView('message-viewer');
    if (!isMsgNew(msg)) return; // If it's already old/seen, no need to update
    if (!msg.seen) {
      await updateMessageSeenStatus(msg.id, true);
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
    setCurrentView('new-project');
  };

  const handleSaveProject = async () => {
    if (!projectForm.title) return alert("Title required.");
    
    // Sanitize before saving (Defense against Stored XSS)
    const data = {
      title: sanitizeInput(projectForm.title),
      desc: sanitizeInput(projectForm.desc),
      liveUrl: sanitizeInput(projectForm.liveUrl),
      codeUrl: sanitizeInput(projectForm.codeUrl),
      image: sanitizeInput(projectForm.imageUrl || 'https://via.placeholder.com/1200x800'),
      stack: techStackList.map(t => sanitizeInput(t)).join(' • '),
      highlights: highlightsList.map(h => sanitizeInput(h)),
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
        if (currentView === 'message-viewer') setCurrentView('messages');
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

  const isMsgNew = (m: any) => {
    if (!m.timestamp) return false;
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
    return m.timestamp.toDate() > fortyEightHoursAgo && !m.seen;
  };

  const newSubmissionsCount = messages.filter(m => isMsgNew(m)).length;

  const addTech = () => {
    if (techInput.trim()) {
      setTechStackList([...techStackList, sanitizeInput(techInput.trim())]);
      setTechInput('');
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setHighlightsList([...highlightsList, sanitizeInput(highlightInput.trim())]);
      setHighlightInput('');
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#f0f2f5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1890ff] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#001529]">
      <div className="w-full max-sm:mx-4 max-w-sm bg-white p-10 rounded shadow-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
           <div className="w-8 h-8 bg-[#1890ff] rounded flex items-center justify-center text-white font-bold">BR</div>
           <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1890ff] outline-none transition-all" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1890ff] outline-none transition-all" />
          <button className="w-full bg-[#1890ff] text-white font-bold py-3 rounded hover:bg-[#40a9ff] transition-colors shadow-lg">Login</button>
        </form>
        {error && <p className="mt-4 text-xs text-red-500 text-center uppercase tracking-widest font-bold">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button onClick={() => setCurrentView(view)} className={`w-full flex items-center justify-between px-6 py-4 transition-all ${active ? 'bg-[#1890ff] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-4">
        <i className={`fas ${icon} w-5 text-center text-sm`}></i>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge ? <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-[#f0f2f5] font-sans overflow-hidden text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#001529] flex flex-col shrink-0 z-50">
          <div className="p-8 pb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1890ff] rounded flex items-center justify-center text-white font-bold">BR</div>
              <h1 className="text-white font-bold text-lg tracking-tight">Portfolio Dashboard</h1>
          </div>
          <nav className="flex-1">
              <SidebarItem icon="fa-th-large" label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-plus-square" label="New Project" view="new-project" active={currentView === 'new-project'} />
              <SidebarItem icon="fa-folder-open" label="Projects" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Messages" view="messages" active={currentView === 'messages'} badge={newSubmissionsCount > 0 ? newSubmissionsCount : undefined} />
          </nav>
          <div className="p-6 border-t border-white/10">
              <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors text-sm font-medium">
                  <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
          </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* HEADER */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-40">
              <div className="flex items-center gap-4">
                <i className="fas fa-bars text-gray-400 cursor-pointer hover:text-gray-600 md:hidden"></i>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{currentView.replace('-', ' ')}</h2>
              </div>
              
              <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => setCurrentView('messages')}>
                    <i className="far fa-bell text-gray-400 text-lg hover:text-[#1890ff] transition-colors"></i>
                    {newSubmissionsCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">{newSubmissionsCount}</span>}
                  </div>
                  <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-900 leading-none">Bhupesh Bhatt</p>
                       <p className="text-[10px] text-gray-400 mt-1 uppercase">Administrator</p>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=B&background=1890ff&color=fff&bold=true" className="w-9 h-9 rounded-full shadow-sm" />
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
                      {/* KPI CARDS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                             <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Deployments</p>
                             <div className="flex items-end justify-between">
                                <p className="text-3xl font-bold text-gray-800">{projects.length}</p>
                                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded">Live</span>
                             </div>
                             <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                                <i className="fas fa-history"></i> Last updated: {new Date().toLocaleDateString()}
                             </div>
                          </div>

                          <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                             <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Inquiries</p>
                             <div className="flex items-end justify-between">
                                <p className="text-3xl font-bold text-gray-800">{messages.length}</p>
                                <span className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Active</span>
                             </div>
                             <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                                <i className="fas fa-signal"></i> Syncing in real-time
                             </div>
                          </div>

                          <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                             <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">New Submissions</p>
                             <div className="flex items-end justify-between">
                                <p className={`text-3xl font-bold ${newSubmissionsCount > 0 ? 'text-red-500' : 'text-gray-800'}`}>{newSubmissionsCount}</p>
                                {newSubmissionsCount > 0 && <span className="animate-pulse bg-red-100 text-red-500 text-[10px] px-2 py-1 rounded font-black">ACTION REQ</span>}
                             </div>
                             <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                                <i className="fas fa-clock"></i> Within last 48 hrs
                             </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* RECENT ASSETS */}
                          <div className="lg:col-span-8 bg-white rounded shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[480px]">
                              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Recent Deployments</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-xs font-bold text-[#1890ff] hover:underline">View Repository</button>
                              </div>
                              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                                 {projects.slice(0, 10).map(p => (
                                     <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                         <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden shadow-inner border border-gray-200">
                                            <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                         </div>
                                         <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">{p.title}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tight mt-0.5">{p.stack}</p>
                                         </div>
                                         <i className="fas fa-chevron-right text-gray-200 text-xs group-hover:text-[#1890ff] group-hover:translate-x-1 transition-all"></i>
                                     </div>
                                 ))}
                                 {projects.length === 0 && <div className="p-20 text-center text-gray-300 italic text-sm">No assets deployed.</div>}
                              </div>
                          </div>

                          {/* RECENT MESSAGES */}
                          <div className="lg:col-span-4 bg-white rounded shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[480px]">
                              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Inquiry Stream</h3>
                              </div>
                              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                                 {messages.slice(0, 10).map(m => {
                                   const isNew = isMsgNew(m);
                                   return (
                                     <div key={m.id} onClick={() => openMessage(m)} className="p-5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                                         <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm shrink-0 border transition-all ${isNew ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-lg shadow-[#1890ff]/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                            {m.name[0].toUpperCase()}
                                         </div>
                                         <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              {/* Sanitize output display */}
                                              <p className={`font-bold text-sm truncate ${isNew ? 'text-[#1890ff]' : 'text-gray-700'}`}>{sanitizeInput(m.name)}</p>
                                              {isNew && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                                            </div>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{m.timestamp?.toDate().toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                   );
                                 })}
                                 {messages.length === 0 && <div className="p-20 text-center text-gray-300 italic text-sm">Silence in the stream.</div>}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECTS LIST */}
              {currentView === 'projects-list' && (
                  <div className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
                      <div className="flex justify-between items-center border-b pb-6">
                        <h2 className="text-xl font-bold text-gray-800">Asset Repository</h2>
                        <button onClick={() => navigateToEditor()} className="bg-[#1890ff] text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-[#40a9ff] transition-all shadow-lg shadow-[#1890ff]/20">New Entry</button>
                      </div>
                      <div className="divide-y divide-gray-50">
                          {projects.map((p, idx) => (
                              <div key={p.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} 
                                   className="py-6 flex items-center gap-6 group hover:bg-gray-50/50 transition-all cursor-grab active:cursor-grabbing px-4 rounded-lg">
                                  <div className="w-4 flex flex-col items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                  </div>
                                  <div className="w-24 h-16 rounded overflow-hidden shadow-sm border bg-gray-100">
                                     <img src={p.image} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-800 text-lg mb-1">{p.title}</p>
                                      <div className="flex flex-wrap gap-2">
                                          {p.stack.split(/[•,]/).map((s, i) => (
                                              <span key={i} className="text-[9px] text-[#1890ff] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold uppercase">{s.trim()}</span>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="hidden lg:flex flex-col gap-1 min-w-[150px] border-l pl-6">
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Key Performance</p>
                                      <div className="flex flex-wrap gap-1">
                                          {(p.highlights || []).slice(0, 2).map((h, i) => (
                                              <span key={i} className="text-[10px] text-gray-500 truncate">• {h}</span>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3 pr-2">
                                      <button onClick={() => navigateToEditor(p)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1890ff] hover:bg-blue-50 rounded transition-all"><i className="fas fa-edit"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"><i className="fas fa-trash-alt"></i></button>
                                  </div>
                              </div>
                          ))}
                          {projects.length === 0 && <div className="py-20 text-center text-gray-400 italic">No projects found. Click "New Entry" to start.</div>}
                      </div>
                  </div>
              )}

              {/* VIEW: NEW PROJECT / EDITOR */}
              {currentView === 'new-project' && (
                  <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-32">
                      <div className="flex items-center justify-between border-b pb-6">
                          <div>
                            <h1 className="text-2xl font-bold text-gray-800">{editingProject ? 'Modify Deployment' : 'New System Entry'}</h1>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Configuring asset specifications...</p>
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('projects-list')} className="px-6 py-2.5 rounded border border-gray-300 text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                              <button onClick={handleSaveProject} className="px-8 py-2.5 bg-[#1890ff] text-white rounded text-sm font-bold hover:bg-[#40a9ff] shadow-lg shadow-[#1890ff]/30 transition-all">Execute Deploy</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* Main Specs */}
                          <div className="lg:col-span-8 bg-white p-10 rounded shadow-sm border border-gray-100 space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Asset Title</label>
                                  <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#1890ff] transition-all font-medium text-sm" placeholder="e.g. Project Nova" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Cover Image URL</label>
                                  <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#1890ff] transition-all font-medium text-sm" placeholder="https://..." />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">System Description</label>
                                 <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#1890ff] transition-all font-medium text-sm min-h-[150px]" placeholder="Brief technical overview..." />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Live Endpoint</label>
                                  <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#1890ff] transition-all font-medium text-sm" placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Source Repository</label>
                                  <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#1890ff] transition-all font-medium text-sm" placeholder="https://github.com/..." />
                                </div>
                              </div>
                          </div>

                          {/* Tech & Highlights */}
                          <div className="lg:col-span-4 space-y-6">
                              <div className="bg-white p-8 rounded shadow-sm border border-gray-100 space-y-6">
                                  <div className="space-y-4">
                                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tech Stack</label>
                                     <div className="flex gap-2">
                                       <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} className="flex-1 px-4 py-3 border border-gray-200 rounded outline-none text-sm" placeholder="Add tech..." />
                                       <button onClick={addTech} type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-bold text-lg">+</button>
                                     </div>
                                     <div className="flex flex-wrap gap-2">
                                       {techStackList.map((t, i) => (
                                         <span key={i} className="px-3 py-1 bg-blue-50 text-[#1890ff] text-xs font-bold rounded border border-blue-100 flex items-center gap-2">
                                           {t} <i className="fas fa-times cursor-pointer hover:text-red-500" onClick={() => setTechStackList(techStackList.filter((_, idx) => idx !== i))}></i>
                                         </span>
                                       ))}
                                     </div>
                                  </div>

                                  <div className="space-y-4 pt-6 border-t border-gray-50">
                                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Performance Highlights</label>
                                     <div className="flex gap-2">
                                       <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())} className="flex-1 px-4 py-3 border border-gray-200 rounded outline-none text-sm" placeholder="Add highlight..." />
                                       <button onClick={addHighlight} type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-bold text-lg">+</button>
                                     </div>
                                     <ul className="space-y-2">
                                       {highlightsList.map((h, i) => (
                                         <li key={i} className="text-xs text-gray-600 flex items-start gap-2 bg-gray-50 p-2 rounded">
                                            <i className="fas fa-check text-green-500 mt-0.5"></i>
                                            <span className="flex-1">{h}</span>
                                            <i className="fas fa-times cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))}></i>
                                         </li>
                                       ))}
                                     </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES */}
              {currentView === 'messages' && (
                <div className="bg-white rounded shadow-sm border border-gray-100 animate-fade-in max-w-7xl mx-auto flex flex-col h-[600px]">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                     <h2 className="text-xl font-bold text-gray-800">Inquiry Stream</h2>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{messages.length} Messages</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                     {messages.map(m => {
                        const isNew = isMsgNew(m);
                        return (
                          <div key={m.id} onClick={() => openMessage(m)} className={`px-8 py-5 flex items-center gap-6 cursor-pointer hover:bg-blue-50/50 transition-colors group ${!m.seen ? 'bg-blue-50/30' : ''}`}>
                             <div className={`w-3 h-3 rounded-full shrink-0 ${!m.seen ? 'bg-[#1890ff]' : 'bg-transparent border border-gray-300'}`}></div>
                             <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm text-lg">
                               {sanitizeInput(m.name).charAt(0).toUpperCase()}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center mb-1">
                                  <h3 className={`font-bold text-base ${!m.seen ? 'text-gray-900' : 'text-gray-600'}`}>{sanitizeInput(m.name)}</h3>
                                  <span className="text-xs text-gray-400 group-hover:text-[#1890ff] transition-colors">{m.timestamp?.toDate().toLocaleString()}</span>
                               </div>
                               <p className={`text-sm truncate ${!m.seen ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{sanitizeInput(m.message)}</p>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, type: 'message', id: m.id, name: `Message from ${m.name}` }); }} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100">
                               <i className="fas fa-trash-alt"></i>
                             </button>
                          </div>
                        );
                     })}
                     {messages.length === 0 && <div className="p-20 text-center text-gray-400 italic">No messages received.</div>}
                  </div>
                </div>
              )}

              {/* VIEW: MESSAGE VIEWER */}
              {currentView === 'message-viewer' && selectedMessage && (
                <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
                   <button onClick={() => setCurrentView('messages')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1890ff] transition-colors mb-4">
                      <i className="fas fa-arrow-left"></i> Back to Stream
                   </button>
                   
                   <div className="bg-white rounded shadow-lg border border-gray-100 overflow-hidden">
                      <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-[#1890ff] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30">
                               {sanitizeInput(selectedMessage.name).charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <h1 className="text-2xl font-bold text-gray-900">{sanitizeInput(selectedMessage.name)}</h1>
                               <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <i className="fas fa-envelope"></i>
                                  <a href={`mailto:${sanitizeInput(selectedMessage.email)}`} className="hover:text-[#1890ff] hover:underline">{sanitizeInput(selectedMessage.email)}</a>
                                </div>
                            </div>
                         </div>
                         <div className="text-right text-xs text-gray-400">
                            <p className="font-bold uppercase tracking-widest mb-1">Received</p>
                            <p>{selectedMessage.timestamp?.toDate().toLocaleString()}</p>
                         </div>
                      </div>
                      
                      <div className="p-10 min-h-[300px]">
                         <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
                           {sanitizeInput(selectedMessage.message)}
                         </p>
                      </div>

                      <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                         <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Message from ${selectedMessage.name}` })} className="px-6 py-2 border border-red-200 text-red-600 rounded text-sm font-bold hover:bg-red-50 transition-colors">Delete</button>
                         <a href={`mailto:${sanitizeInput(selectedMessage.email)}`} className="px-6 py-2 bg-[#1890ff] text-white rounded text-sm font-bold hover:bg-[#40a9ff] transition-colors shadow-lg shadow-blue-500/20">Reply via Email</a>
                      </div>
                   </div>
                </div>
              )}

          </div>

          {/* DELETE CONFIRMATION MODAL */}
          {deleteModal && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xl mb-4 mx-auto">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Confirm Deletion</h3>
                <p className="text-gray-500 text-center text-sm mb-6">
                  Are you sure you want to delete <span className="font-bold text-gray-800">"{sanitizeInput(deleteModal.name)}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-300 rounded text-gray-700 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">Delete</button>
                </div>
              </div>
            </div>
          )}

      </main>
    </div>
  );
};

export default Admin;