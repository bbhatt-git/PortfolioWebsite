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
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Overlay States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
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
    if (!projectForm.title || techStackList.length === 0) return alert("Subject and Tech required.");
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

  const Overlay = ({ title, onClose, children, maxWidth = "max-w-4xl" }: any) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className={`w-full ${maxWidth} glass-strong rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in`}>
        <div className="h-14 bg-white/40 dark:bg-black/20 border-b border-black/5 flex items-center px-8 shrink-0 relative">
          <div className="flex gap-2">
            <div onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:brightness-90"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{title}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">{children}</div>
      </div>
    </div>
  );

  if (loading) return <div className="h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center text-blue-600"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 font-sans">
      <div className="glass-strong p-12 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 text-white font-black text-2xl">BR</div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Admin Identity" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">Authenticate</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#050505] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans selection:bg-blue-500/20">
      
      {/* 1. MINIMAL SIDEBAR */}
      <aside className="w-20 md:w-72 glass-strong border-r border-black/5 flex flex-col shrink-0 z-50 transition-all">
          <div className="p-8 pb-12 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">BR</div>
              <span className="hidden md:block font-black text-xl tracking-tighter">Control Hub</span>
          </div>
          <nav className="flex-1 px-4 space-y-2">
              <button 
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
              >
                  <i className="fas fa-layer-group text-lg"></i>
                  <span className="hidden md:block font-bold text-sm">Projects</span>
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
              >
                  <i className="fas fa-envelope text-lg"></i>
                  <span className="hidden md:block font-bold text-sm">Inbox</span>
                  {messages.length > 0 && <span className="hidden md:flex w-5 h-5 rounded-full bg-red-500 text-[10px] items-center justify-center text-white">{messages.length}</span>}
              </button>
          </nav>
          <div className="p-8">
              <button onClick={() => signOut(auth)} className="w-full p-4 bg-black/5 dark:bg-white/5 text-gray-400 hover:text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Disconnect</button>
          </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar bg-noise">
          <div className="max-w-7xl mx-auto animate-fade-up">
              <header className="flex justify-between items-end mb-16">
                  <div>
                      <h1 className="text-5xl font-black tracking-tight mb-2">{activeTab === 'projects' ? 'Project Deployments' : 'Inbox Activity'}</h1>
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Operational Management Interface</p>
                      </div>
                  </div>
                  {activeTab === 'projects' && (
                    <button onClick={() => openProjectModal()} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        <i className="fas fa-plus mr-3"></i> Add Deployment
                    </button>
                  )}
              </header>

              {activeTab === 'projects' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                      {projects.map(proj => (
                          <div key={proj.id} onClick={() => openProjectModal(proj)} className="group glass-strong p-4 rounded-[2.5rem] border border-black/5 cursor-pointer hover:-translate-y-2 transition-all duration-500 relative">
                              <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-6 border border-black/5">
                                  <img src={proj.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="px-6 py-2 rounded-full glass border border-white/40 text-xs font-black text-white uppercase tracking-widest">Update Spec</span>
                                  </div>
                              </div>
                              <div className="px-4 pb-4">
                                <h3 className="font-bold text-xl mb-1 truncate">{proj.title}</h3>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-6">{proj.stack}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-xs"><i className="fas fa-edit"></i></div>
                                        <button onClick={(e) => { e.stopPropagation(); if(confirm('Purge deployment?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center text-xs hover:bg-red-600 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                    <span className="text-[9px] font-black opacity-20 uppercase">ID: {proj.id.slice(0,8)}</span>
                                </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="glass-strong rounded-[2.5rem] border border-black/5 overflow-hidden">
                      <div className="divide-y divide-black/5">
                          {messages.map(msg => (
                              <div key={msg.id} onClick={() => setSelectedMessage(msg)} className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-all group">
                                  <div className="flex gap-8 items-center">
                                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 flex items-center justify-center text-xl font-black">{msg.name[0]}</div>
                                      <div>
                                          <h4 className="font-bold text-lg">{msg.name}</h4>
                                          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{msg.email}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-12">
                                      <div className="hidden lg:block">
                                          <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-sm">{msg.message}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{msg.timestamp?.toDate().toLocaleDateString()}</p>
                                          <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"></i>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                      {messages.length === 0 && <div className="p-32 text-center opacity-10"><i className="fas fa-inbox text-8xl mb-4"></i><p className="font-black uppercase tracking-[0.5em]">No Signals Detected</p></div>}
                  </div>
              )}
          </div>
      </main>

      {/* OVERLAY: PROJECT MODAL */}
      {isProjectModalOpen && (
        <Overlay title={editingProject ? "Deployment Specification" : "New Signal Compose"} onClose={() => setIsProjectModalOpen(false)}>
            <div className="space-y-12 pb-12">
                <section className="space-y-8">
                    <div className="flex items-center gap-6 border-b border-black/5 pb-4">
                        <span className="text-[10px] font-black opacity-20 uppercase w-24">Subject:</span>
                        <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-3xl font-black outline-none placeholder:opacity-10" placeholder="Project Name..." />
                    </div>
                    <div className="flex items-center gap-6 border-b border-black/5 pb-4">
                        <span className="text-[10px] font-black opacity-20 uppercase w-24">Visual Asset:</span>
                        <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="flex-1 bg-transparent text-sm font-bold text-blue-600 outline-none placeholder:opacity-20" placeholder="Image CDN URL..." />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Tech System */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 flex items-center gap-3">
                            <i className="fas fa-microchip"></i> Tech Arsenal
                        </h4>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5">
                            {techStackList.map(t => (
                                <div key={t} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center gap-3 shadow-lg">
                                    {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="hover:text-red-300"><i className="fas fa-times"></i></button>
                                </div>
                            ))}
                        </div>
                        <input 
                          value={techInput} 
                          onChange={e => setTechInput(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))}
                          className="w-full p-4 rounded-2xl border border-black/5 bg-white dark:bg-black text-sm font-bold outline-none" 
                          placeholder="Type tech & press Enter..." 
                        />
                    </div>

                    {/* Highlights System */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 flex items-center gap-3">
                            <i className="fas fa-bolt"></i> Performance Highlights
                        </h4>
                        <div className="space-y-2 p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5">
                            {highlightsList.map((h, i) => (
                                <div key={i} className="p-3 bg-white dark:bg-black rounded-xl border border-black/5 flex justify-between items-center text-xs font-bold">
                                    <span className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> {h}</span>
                                    <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            ))}
                        </div>
                        <input 
                          value={highlightInput} 
                          onChange={e => setHighlightInput(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))}
                          className="w-full p-4 rounded-2xl border border-black/5 bg-white dark:bg-black text-sm font-bold outline-none" 
                          placeholder="Add achievement & press Enter..." 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase opacity-20 tracking-widest">Production Link</label>
                        <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase opacity-20 tracking-widest">Source Repo</label>
                        <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none" />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase opacity-20 tracking-widest">Narrative Specification</label>
                    <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-48 p-8 rounded-[2.5rem] bg-black/5 border border-black/5 text-lg leading-relaxed outline-none" placeholder="The story behind this deployment..." />
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={() => setIsProjectModalOpen(false)} className="px-10 py-4 rounded-2xl hover:bg-black/5 font-black text-[10px] uppercase tracking-widest opacity-40">Discard Draft</button>
                    <button onClick={handleSaveProject} className="px-16 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-500 flex items-center gap-3 transition-all">
                        <i className="fas fa-paper-plane"></i> Deploy Signal
                    </button>
                </div>
            </div>
        </Overlay>
      )}

      {/* OVERLAY: MESSAGE DETAIL */}
      {selectedMessage && (
          <Overlay title="Transmission Logs" onClose={() => setSelectedMessage(null)} maxWidth="max-w-3xl">
              <div className="space-y-12">
                  <div className="border-b border-black/5 pb-12">
                      <div className="flex items-center gap-8 mb-10">
                          <div className="w-24 h-24 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl">{selectedMessage.name[0]}</div>
                          <div>
                              <h2 className="text-5xl font-black tracking-tighter mb-2">{selectedMessage.name}</h2>
                              <p className="text-xl text-blue-600 font-bold lowercase">{selectedMessage.email}</p>
                          </div>
                      </div>
                      <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                          <div className="flex items-center gap-2"><i className="fas fa-calendar"></i> {selectedMessage.timestamp?.toDate().toLocaleString()}</div>
                          <div className="flex items-center gap-2"><i className="fas fa-shield-alt"></i> Secure Signal</div>
                      </div>
                  </div>
                  
                  <div className="text-2xl leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                      {selectedMessage.message}
                  </div>
                  
                  <div className="pt-12 flex gap-4">
                      <a href={`mailto:${selectedMessage.email}`} className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-center shadow-2xl hover:bg-blue-500 transition-all">Establish Reply</a>
                      <button onClick={async () => { if(confirm('Purge transmission?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setSelectedMessage(null); } }} className="px-12 py-6 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Purge</button>
                  </div>
              </div>
          </Overlay>
      )}

    </div>
  );
};

export default Admin;