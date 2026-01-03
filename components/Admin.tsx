import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import { Project } from '../types';

type AdminView = 'dashboard' | 'form' | 'list' | 'messages' | 'project-editor' | 'message-viewer';

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
    if (!msg.seen) {
      await updateMessageSeenStatus(msg.id, true);
    }
  };

  const handleToggleSeen = async (e: React.MouseEvent, msgId: string, currentStatus: boolean) => {
    e.stopPropagation();
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
      setCurrentView('list');
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

  const unseenCount = messages.filter(m => !m.seen).length;

  if (loading) return (
    <div className="h-screen bg-[#f0f2f5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1890ff] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#001529]">
      <div className="w-full max-w-sm bg-white p-10 rounded-lg shadow-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
           <div className="w-8 h-8 bg-[#1890ff] rounded flex items-center justify-center text-white font-bold">BR</div>
           <h1 className="text-xl font-bold tracking-tight">Admin Login</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#1890ff] outline-none" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#1890ff] outline-none" />
          <button className="w-full bg-[#1890ff] text-white font-bold py-3 rounded hover:bg-[#40a9ff] transition-colors shadow-lg">Login</button>
        </form>
        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active, badge }: { icon: string, label: string, view: AdminView, active: boolean, badge?: number }) => (
    <button onClick={() => setCurrentView(view)} className={`w-full flex items-center justify-between px-6 py-4 transition-all ${active ? 'bg-[#1890ff] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">
        <i className={`fas ${icon} w-5 text-center`}></i>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge ? <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen flex bg-[#f0f2f5] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#001529] flex flex-col shrink-0 z-50">
          <div className="p-6 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-4 h-2 bg-white rounded-full"></div>
              </div>
              <h1 className="text-white font-bold text-lg tracking-tight">logoipsum</h1>
          </div>
          <nav className="flex-1 mt-4">
              <SidebarItem icon="fa-th-large" label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-edit" label="Form" view="project-editor" active={currentView === 'project-editor'} />
              <SidebarItem icon="fa-list" label="List" view="list" active={currentView === 'list'} />
              <SidebarItem icon="fa-envelope" label="Messages" view="messages" active={currentView === 'messages'} badge={unseenCount > 0 ? unseenCount : undefined} />
              <SidebarItem icon="fa-user" label="Profile" view="dashboard" active={false} />
              <SidebarItem icon="fa-check-circle" label="Result" view="dashboard" active={false} />
              <SidebarItem icon="fa-exclamation-triangle" label="Exception" view="dashboard" active={false} />
              <SidebarItem icon="fa-cog" label="Account" view="dashboard" active={false} />
          </nav>
          <div className="p-4 border-t border-white/10">
              <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  <i className="fas fa-sign-out-alt"></i> Logout
              </button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* TOP HEADER */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-40">
              <div className="flex items-center gap-6">
                <i className="fas fa-bars text-gray-400 cursor-pointer hover:text-gray-600"></i>
              </div>
              
              <div className="flex items-center gap-6">
                  <i className="fas fa-search text-gray-400 cursor-pointer"></i>
                  <i className="far fa-question-circle text-gray-400 cursor-pointer"></i>
                  <div className="relative cursor-pointer" onClick={() => setCurrentView('messages')}>
                    <i className="far fa-bell text-gray-400"></i>
                    {unseenCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{unseenCount}</span>}
                  </div>
                  <div className="flex items-center gap-2 border-l pl-6 border-gray-200">
                    <img src="https://ui-avatars.com/api/?name=Bhupesh&background=1890ff&color=fff" className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Bhupesh</span>
                  </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* DASHBOARD VIEW */}
              {currentView === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in">
                      {/* Metric Cards Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 relative">
                             <div className="flex justify-between items-start mb-2">
                               <p className="text-gray-400 text-sm">Total Projects</p>
                               <i className="fas fa-info-circle text-gray-300 text-xs"></i>
                             </div>
                             <p className="text-3xl font-medium text-gray-800">$ {projects.length * 1540}</p>
                             <div className="mt-4 flex gap-4 text-xs text-gray-500">
                               <span>Growth ratio <span className="text-red-500">13% ▲</span></span>
                               <span>Active ratio <span className="text-green-500">10% ▼</span></span>
                             </div>
                             <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                               Daily Additions <span className="font-medium">1.2</span>
                             </div>
                          </div>

                          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-2">
                               <p className="text-gray-400 text-sm">Site Visits</p>
                               <i className="fas fa-info-circle text-gray-300 text-xs"></i>
                             </div>
                             <p className="text-3xl font-medium text-gray-800">6,480</p>
                             <div className="mt-4 h-10 flex items-end gap-1">
                                {[30,45,25,60,40,55,70,35,45,50].map((h, i) => (
                                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-[#1890ff]/40 rounded-t-sm"></div>
                                ))}
                             </div>
                             <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                               Day visits <span className="font-medium">4,280</span>
                             </div>
                          </div>

                          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                             <div className="flex justify-between items-start mb-2">
                               <p className="text-gray-400 text-sm">Signals</p>
                               <i className="fas fa-info-circle text-gray-300 text-xs"></i>
                             </div>
                             <p className="text-3xl font-medium text-gray-800">{messages.length}</p>
                             <div className="mt-4 flex gap-1 h-10 items-end">
                                {[40,60,30,70,50,40,60].map((h, i) => (
                                    <div key={i} style={{ height: `${h}%` }} className="w-2 bg-[#1890ff] rounded-t-sm"></div>
                                ))}
                             </div>
                             <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                               Conversion rate <span className="font-medium">50%</span>
                             </div>
                          </div>

                          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 text-center flex flex-col justify-center">
                             <p className="text-gray-400 text-sm mb-4">Operation Effect</p>
                             <p className="text-4xl font-light text-gray-800">88%</p>
                             <div className="mt-6 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#1890ff] h-full w-[88%]"></div>
                             </div>
                          </div>
                      </div>

                      {/* Charts Area */}
                      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                          <div className="flex border-b border-gray-100 px-6 py-4 items-center justify-between">
                             <div className="flex gap-8 text-sm font-medium">
                               <span className="text-[#1890ff] border-b-2 border-[#1890ff] pb-4 -mb-4.5 cursor-pointer">Engagement</span>
                               <span className="text-gray-500 cursor-pointer">Visits</span>
                             </div>
                             <div className="flex gap-4 text-xs text-gray-500">
                               <span>All day</span>
                               <span>All week</span>
                               <span>All month</span>
                               <span className="text-[#1890ff] font-bold">All year</span>
                               <div className="ml-4 border px-2 py-1 rounded text-[10px] flex items-center gap-2">
                                  2020-01-01 ~ 2020-12-31 <i className="far fa-calendar-alt"></i>
                               </div>
                             </div>
                          </div>

                          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                              <div className="lg:col-span-8">
                                 <h3 className="text-base font-medium text-gray-800 mb-8">Asset Deployment Trend</h3>
                                 <div className="h-64 flex items-end justify-between border-b border-gray-100 pb-4 relative">
                                    <div className="absolute left-0 top-0 text-[10px] text-gray-300">60</div>
                                    <div className="absolute left-0 top-1/4 text-[10px] text-gray-300">45</div>
                                    <div className="absolute left-0 top-2/4 text-[10px] text-gray-300">30</div>
                                    <div className="absolute left-0 top-3/4 text-[10px] text-gray-300">15</div>
                                    
                                    {[35,50,40,25,30,45,60,55,40,45].map((h, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                            <div style={{ height: `${h * 4}px` }} className="w-8 bg-[#1890ff]/30 hover:bg-[#1890ff] transition-all"></div>
                                            <span className="text-[10px] text-gray-400">{2017 + Math.floor(i / 2.5)}</span>
                                        </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="lg:col-span-4">
                                 <h3 className="text-base font-medium text-gray-800 mb-8">Popular Assets</h3>
                                 <div className="space-y-6">
                                    {projects.slice(0, 7).map((p, i) => (
                                        <div key={p.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${i < 3 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                                                <span className="text-gray-600">{p.title}</span>
                                            </div>
                                            <span className="text-gray-400">432,641</span>
                                        </div>
                                    ))}
                                 </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* PROJECT LIST VIEW */}
              {currentView === 'list' && (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Asset Archive</h2>
                        <button onClick={() => navigateToEditor()} className="bg-[#1890ff] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#40a9ff] transition-all">New Asset</button>
                      </div>
                      <div className="border-t divide-y">
                          {projects.map((p, idx) => (
                              <div key={p.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} 
                                   className="py-6 flex items-center gap-6 group hover:bg-gray-50 transition-all cursor-grab active:cursor-grabbing">
                                  <div className="w-4 flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  </div>
                                  <img src={p.image} className="w-20 h-14 object-cover rounded shadow-sm border" />
                                  <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-800 text-lg mb-1">{p.title}</p>
                                      <div className="flex flex-wrap gap-2">
                                          {p.stack.split(/[•,]/).map((s, i) => (
                                              <span key={i} className="text-[10px] text-[#1890ff] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">{s.trim()}</span>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  {/* Highlights Restoration Section */}
                                  <div className="hidden lg:block max-w-[200px] border-l pl-4">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Highlights</p>
                                      <div className="flex flex-wrap gap-1">
                                          {(p.highlights || []).slice(0, 3).map((h, i) => (
                                              <span key={i} className="text-[9px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">• {h}</span>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                      <button onClick={() => navigateToEditor(p)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1890ff] hover:bg-blue-50 rounded transition-all"><i className="fas fa-edit"></i></button>
                                      <button onClick={() => setDeleteModal({ show: true, type: 'project', id: p.id, name: p.title })} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"><i className="fas fa-trash-alt"></i></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* MESSAGES LIST VIEW */}
              {currentView === 'messages' && (
                  <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                      <div className="p-6 border-b flex justify-between items-center">
                          <h2 className="text-xl font-bold">Signal Stream</h2>
                          <div className="text-xs text-gray-400">{messages.length} total signals</div>
                      </div>
                      <div className="divide-y">
                          {messages.map(m => (
                              <div key={m.id} onClick={() => openMessage(m)} className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-all">
                                  <div className="flex items-center gap-6">
                                      <div className={`w-12 h-12 rounded flex items-center justify-center font-bold text-lg border transition-all ${!m.seen ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                        {m.name[0].toUpperCase()}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-3">
                                            <h4 className={`font-bold text-base tracking-tight ${!m.seen ? 'text-[#1890ff]' : 'text-gray-700'}`}>{m.name}</h4>
                                            <button onClick={(e) => handleToggleSeen(e, m.id, m.seen)} className={`w-8 h-8 rounded flex items-center justify-center transition-all ${m.seen ? 'text-[#1890ff] bg-blue-50' : 'text-gray-300'}`}>
                                              <i className={`fas ${m.seen ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                                            </button>
                                          </div>
                                          <p className="text-xs text-gray-400">{m.email}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Logged At</p>
                                      <p className="text-xs text-gray-500">{m.timestamp?.toDate().toLocaleString()}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* PROJECT EDITOR VIEW */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-20">
                      <div className="flex items-center justify-between border-b pb-6">
                          <h1 className="text-2xl font-bold">{editingProject ? 'Modify Asset' : 'Deploy New Asset'}</h1>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('list')} className="px-6 py-2 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50">Cancel</button>
                              <button onClick={handleSaveProject} className="px-6 py-2 bg-[#1890ff] text-white rounded text-sm font-medium hover:bg-[#40a9ff] shadow-lg">Submit Asset</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 bg-white p-10 rounded shadow-sm border space-y-8">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                                <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-[#1890ff] outline-none" placeholder="Project name..." />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Image Media</label>
                                <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-[#1890ff] outline-none" placeholder="Media URL..." />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Live URL</label>
                                    <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-[#1890ff] outline-none" placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Source URL</label>
                                    <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-[#1890ff] outline-none" placeholder="https://github..." />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                                <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full px-4 py-3 border rounded h-40 resize-none outline-none focus:ring-2 focus:ring-[#1890ff]" placeholder="Narrative..." />
                              </div>
                          </div>

                          <div className="space-y-8">
                              <div className="bg-white p-8 rounded shadow-sm border space-y-6">
                                   <div className="space-y-4">
                                       <label className="text-xs font-bold text-gray-400 uppercase">Tech Stack</label>
                                       <div className="flex gap-2">
                                          <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 px-3 py-2 border rounded text-sm outline-none" placeholder="Add tool..." />
                                          <button onClick={() => { if(techInput) {setTechStackList([...techStackList, techInput]); setTechInput('');} }} className="w-10 h-10 bg-[#1890ff] text-white rounded font-bold">+</button>
                                       </div>
                                       <div className="flex flex-wrap gap-1">
                                           {techStackList.map(t => (
                                               <span key={t} className="px-2 py-1 bg-blue-50 text-[10px] text-[#1890ff] border border-blue-100 rounded flex items-center gap-2">
                                                   {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-400">×</button>
                                               </span>
                                           ))}
                                       </div>
                                   </div>

                                   {/* Key Highlights Logic Restoration */}
                                   <div className="space-y-4 border-t pt-6">
                                       <label className="text-xs font-bold text-gray-400 uppercase">Key Highlights</label>
                                       <div className="flex gap-2">
                                          <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="flex-1 px-3 py-2 border rounded text-sm outline-none" placeholder="Add metric..." />
                                          <button onClick={() => { if(highlightInput) {setHighlightsList([...highlightsList, highlightInput]); setHighlightInput('');} }} className="w-10 h-10 bg-gray-800 text-white rounded font-bold">+</button>
                                       </div>
                                       <div className="space-y-2">
                                           {highlightsList.map((h, i) => (
                                               <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs text-gray-600">
                                                   <span className="truncate pr-2">• {h}</span>
                                                   <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><i className="fas fa-times"></i></button>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                              </div>
                              <div className="bg-white p-4 rounded shadow-sm border"><img src={projectForm.imageUrl || 'https://via.placeholder.com/400x300'} className="w-full rounded" /></div>
                          </div>
                      </div>
                  </div>
              )}

              {/* MESSAGE VIEWER VIEW */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-in flex justify-center pt-10">
                      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-200">
                          <div className="h-12 flex items-center px-6 justify-between bg-gray-50 border-b">
                             <div className="flex gap-2">
                               <div onClick={() => setCurrentView('messages')} className="w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer"></div>
                               <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                               <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                             </div>
                             <div className="flex items-center gap-4">
                                <button onClick={(e) => handleToggleSeen(e, selectedMessage.id, selectedMessage.seen)} className={`text-[10px] font-bold flex items-center gap-2 ${selectedMessage.seen ? 'text-[#1890ff]' : 'text-gray-400'}`}>
                                  <i className={`fas ${selectedMessage.seen ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                  {selectedMessage.seen ? 'READ' : 'UNREAD'}
                                </button>
                                <i onClick={() => setCurrentView('messages')} className="fas fa-times text-gray-400 cursor-pointer hover:text-red-500"></i>
                             </div>
                          </div>
                          <div className="p-10 space-y-8">
                             <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-gray-50 rounded border">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">From</p>
                                 <p className="font-bold text-gray-800">{selectedMessage.name}</p>
                               </div>
                               <div className="p-4 bg-gray-50 rounded border overflow-hidden">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
                                 <p className="font-bold text-[#1890ff] truncate">{selectedMessage.email}</p>
                               </div>
                             </div>
                             <div className="p-6 min-h-[200px] text-gray-700 leading-relaxed text-base bg-white border rounded shadow-inner whitespace-pre-wrap">{selectedMessage.message}</div>
                          </div>
                          <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
                             <button onClick={() => setDeleteModal({ show: true, type: 'message', id: selectedMessage.id, name: `Signal from ${selectedMessage.name}` })} className="text-red-500 text-xs font-bold hover:underline">Purge Signal</button>
                             <a href={`mailto:${selectedMessage.email}`} className="bg-[#1890ff] text-white px-8 py-3 rounded font-bold text-sm shadow-md hover:bg-[#40a9ff]">Reply Now</a>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-[340px] bg-white rounded-lg shadow-2xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl mb-6 bg-red-50 text-red-500"><i className="fas fa-trash-alt"></i></div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Verification</h3>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">This action is irreversible. Confirm purging <span className="font-bold text-red-500">"{deleteModal.name}"</span>?</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded border font-bold text-sm hover:bg-gray-50">Abort</button>
                      <button onClick={handleDelete} className="flex-1 py-3 rounded bg-red-500 text-white font-bold text-sm shadow-lg hover:bg-red-600">Confirm</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;