import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Project } from '../types';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<'projects' | 'inbox'>('projects');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Modal States
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
    } catch (err) { setError('Access Denied'); }
  };

  const openProjectModal = (proj?: Project) => {
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
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Title and Tech required.");
    const data = {
      ...projectForm,
      image: projectForm.imageUrl || 'https://via.placeholder.com/1200x800',
      stack: techStackList.join(' • '),
      highlights: highlightsList,
      caseStudy: caseStudyForm,
      order: editingProject ? editingProject.order : projects.length
    };
    if (editingProject) await updateDoc(doc(db, "projects", editingProject.id), data);
    else await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
    fetchProjects();
    setIsProjectModalOpen(false);
  };

  // Glass Modal Wrapper with macOS Traffic Lights
  const GlassModal = ({ title, onClose, children, maxWidth = "max-w-4xl" }: any) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
      <div className={`w-full ${maxWidth} bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in`}>
        <div className="h-14 bg-white/40 dark:bg-black/20 border-b border-black/5 flex items-center px-6 shrink-0 relative">
          <div className="flex gap-2">
            <div onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:brightness-90"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{title}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );

  if (loading) return <div className="h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center text-blue-600"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 font-sans">
      <div className="glass-strong p-12 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/20 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 text-white font-black text-2xl">BR</div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">Authenticate</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#050505] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans selection:bg-blue-500/20">
      
      {/* 1. MINIMAL SIDEBAR */}
      <aside className="w-20 md:w-64 glass-strong border-r border-black/5 flex flex-col shrink-0 z-50">
          <div className="p-8 pb-12 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">BR</div>
              <span className="hidden md:block font-bold text-lg tracking-tight">Admin Hub</span>
          </div>
          <nav className="flex-1 px-4 space-y-2">
              <button 
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
              >
                  <i className="fas fa-layer-group"></i>
                  <span className="hidden md:block font-bold text-sm">Deployments</span>
              </button>
              <button 
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'inbox' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
              >
                  <i className="fas fa-envelope"></i>
                  <span className="hidden md:block font-bold text-sm">Messages</span>
              </button>
          </nav>
          <button onClick={() => signOut(auth)} className="m-8 p-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Sign Out</button>
      </aside>

      {/* 2. MAIN STAGE */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          
          <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                  <div>
                      <h1 className="text-4xl font-black tracking-tight">{activeTab === 'projects' ? 'Your Projects' : 'Inbound Messages'}</h1>
                      <p className="text-gray-500 mt-2 font-medium">Manage your production workspace.</p>
                  </div>
                  {activeTab === 'projects' && (
                    <button onClick={() => openProjectModal()} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                        <i className="fas fa-plus"></i> New Project
                    </button>
                  )}
              </div>

              {activeTab === 'projects' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {projects.map(proj => (
                          <div key={proj.id} onClick={() => openProjectModal(proj)} className="group glass-strong p-4 rounded-3xl border border-black/5 cursor-pointer hover:-translate-y-2 transition-all duration-500">
                              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                                  <img src={proj.image} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              <h3 className="font-bold text-lg mb-1 truncate">{proj.title}</h3>
                              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-6">{proj.stack}</p>
                              <div className="flex justify-between">
                                  <span className="text-[10px] font-black text-blue-600">EDIT DETAILS</span>
                                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-trash-alt"></i></button>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="space-y-4">
                      {messages.map(msg => (
                          <div key={msg.id} onClick={() => setSelectedMessage(msg)} className="glass-strong p-6 rounded-2xl border border-black/5 flex items-center justify-between cursor-pointer hover:bg-white transition-all group">
                              <div className="flex gap-6 items-center">
                                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-lg font-black">{msg.name[0]}</div>
                                  <div>
                                      <h4 className="font-bold">{msg.name}</h4>
                                      <p className="text-xs text-blue-600 font-medium">{msg.email}</p>
                                  </div>
                              </div>
                              <div className="text-right flex items-center gap-8">
                                  <span className="text-[10px] font-black opacity-30">{msg.timestamp?.toDate().toLocaleDateString()}</span>
                                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><i className="fas fa-chevron-right text-[10px]"></i></div>
                              </div>
                          </div>
                      ))}
                      {messages.length === 0 && <p className="text-center py-20 opacity-20 italic">No messages received yet.</p>}
                  </div>
              )}
          </div>
      </main>

      {/* OVERLAY: PROJECT EDITOR MODAL */}
      {isProjectModalOpen && (
        <GlassModal title={editingProject ? "Update Project" : "New Deployment"} onClose={() => setIsProjectModalOpen(false)}>
            <div className="flex flex-col h-full">
                {/* Header Inputs */}
                <div className="p-10 border-b border-black/5 bg-gray-50/50 dark:bg-transparent">
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 border-b border-black/5 pb-3">
                            <span className="text-[10px] font-black opacity-30 uppercase w-20">Subject:</span>
                            <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-2xl font-black outline-none" placeholder="Project Title..." />
                        </div>
                        <div className="flex items-center gap-6 border-b border-black/5 pb-3">
                            <span className="text-[10px] font-black opacity-30 uppercase w-20">CDN Link:</span>
                            <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="flex-1 bg-transparent text-sm font-medium outline-none" placeholder="Thumbnail Image URL..." />
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-10 space-y-12">
                    
                    {/* Interactive Tech Pills */}
                    <div className="p-8 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2"><i className="fas fa-microchip text-blue-500"></i> Tech Stack</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {techStackList.map(t => (
                                <div key={t} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center gap-3">
                                    {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="hover:text-red-300 transition-colors"><i className="fas fa-times"></i></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                              value={techInput} 
                              onChange={e => setTechInput(e.target.value)} 
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))}
                              className="flex-1 p-4 rounded-xl border border-black/5 bg-white text-sm outline-none" 
                              placeholder="Add technology (Enter)..." 
                            />
                        </div>
                    </div>

                    {/* Interactive Highlights */}
                    <div className="p-8 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2"><i className="fas fa-star text-yellow-500"></i> Performance Highlights</h4>
                        <div className="space-y-3 mb-6">
                            {highlightsList.map((h, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white dark:bg-black border border-black/5 flex justify-between items-center text-sm font-medium">
                                    <span>{h}</span>
                                    <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-500"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                              value={highlightInput} 
                              onChange={e => setHighlightInput(e.target.value)} 
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))}
                              className="flex-1 p-4 rounded-xl border border-black/5 bg-white text-sm outline-none" 
                              placeholder="Add bullet point (Enter)..." 
                            />
                        </div>
                    </div>

                    {/* Standard Inputs */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30">Live URL</label>
                            <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 border border-black/5 text-sm outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30">Repo URL</label>
                            <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 border border-black/5 text-sm outline-none" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase opacity-30">Description</label>
                        <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-40 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-base leading-relaxed outline-none" placeholder="Explain the project scope..." />
                    </div>
                </div>

                <div className="p-8 border-t border-black/5 flex justify-end gap-4 shrink-0">
                    <button onClick={() => setIsProjectModalOpen(false)} className="px-8 py-3 rounded-xl hover:bg-black/5 font-black text-[10px] uppercase">Cancel</button>
                    <button onClick={handleSaveProject} className="px-12 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Deploy Signal</button>
                </div>
            </div>
        </GlassModal>
      )}

      {/* OVERLAY: MESSAGE VIEWER MODAL */}
      {selectedMessage && (
          <GlassModal title="Message Viewer" onClose={() => setSelectedMessage(null)} maxWidth="max-w-2xl">
              <div className="p-10 md:p-14 space-y-10 animate-fade-up">
                  <div className="border-b border-black/5 pb-10">
                      <h2 className="text-4xl font-black tracking-tight mb-8">{selectedMessage.name}</h2>
                      <div className="space-y-2 text-xs font-black uppercase tracking-widest opacity-40">
                          <div>From: <span className="text-blue-600 lowercase">{selectedMessage.email}</span></div>
                          <div>Received: {selectedMessage.timestamp?.toDate().toLocaleString()}</div>
                      </div>
                  </div>
                  <div className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                      {selectedMessage.message}
                  </div>
                  <div className="pt-10 flex gap-4">
                      <a href={`mailto:${selectedMessage.email}`} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-xl">Reply via Email</a>
                      <button onClick={async () => { if(confirm('Delete?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setSelectedMessage(null); } }} className="px-10 py-5 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest">Delete</button>
                  </div>
              </div>
          </GlassModal>
      )}

    </div>
  );
};

export default Admin;