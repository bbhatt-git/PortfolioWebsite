import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Project } from '../types';

type AdminView = 'dashboard' | 'project-editor' | 'message-viewer';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Selection State
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
    } catch (err) { setError('Access Denied: Invalid Credentials'); }
  };

  const openProjectEditor = (proj?: Project) => {
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

  const openMessageViewer = (msg: any) => {
    setSelectedMessage(msg);
    setCurrentView('message-viewer');
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Subject and Tech Stack are mandatory.");
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
    setCurrentView('dashboard');
  };

  if (loading) return (
    <div className="h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505] p-6">
      <div className="glass-strong p-12 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 text-white font-black text-xl">BR</div>
        <h2 className="text-xl font-bold mb-8 tracking-tight">System Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Identity" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <input type="password" placeholder="Key" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-blue-500 transition-all uppercase tracking-[0.2em] text-[10px]">Authorize</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#080808] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans selection:bg-blue-500/20">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-20 md:w-64 glass-strong border-r border-black/5 flex flex-col shrink-0 z-50">
          <div className="p-8 pb-12">
              <div onClick={() => setCurrentView('dashboard')} className="flex items-center gap-4 mb-12 cursor-pointer group">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">BR</div>
                  <span className="hidden md:block font-black text-lg tracking-tight">Admin Console</span>
              </div>
              <nav className="space-y-2">
                  <button 
                    onClick={() => { setActiveTab('projects'); setCurrentView('dashboard'); }} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'projects' && currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-40 hover:opacity-100'}`}
                  >
                      <i className="fas fa-layer-group"></i>
                      <span className="hidden md:block font-bold text-sm">Deployments</span>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('messages'); setCurrentView('dashboard'); }} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'messages' && currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-40 hover:opacity-100'}`}
                  >
                      <i className="fas fa-envelope"></i>
                      <span className="hidden md:block font-bold text-sm">Messages</span>
                  </button>
              </nav>
          </div>
          <div className="mt-auto p-8">
              <button onClick={() => signOut(auth)} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Disconnect</button>
          </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* DASHBOARD LIST VIEW */}
          {currentView === 'dashboard' && (
              <div className="p-8 md:p-16 max-w-7xl mx-auto animate-fade-up">
                  <header className="flex justify-between items-end mb-16">
                      <div>
                          <h1 className="text-5xl font-black tracking-tighter">{activeTab === 'projects' ? 'Project Repository' : 'Inbox Activity'}</h1>
                          <p className="text-gray-400 mt-2 font-medium tracking-wide uppercase text-[10px]">Secure Management Interface</p>
                      </div>
                      {activeTab === 'projects' && (
                          <button onClick={() => openProjectEditor()} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                              <i className="fas fa-plus mr-3"></i> Create Deployment
                          </button>
                      )}
                  </header>

                  {activeTab === 'projects' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                          {projects.map(proj => (
                              <div key={proj.id} onClick={() => openProjectEditor(proj)} className="group glass-strong p-4 rounded-[2.5rem] border border-black/5 cursor-pointer hover:-translate-y-2 transition-all duration-500 shadow-xl">
                                  <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 border border-black/5">
                                      <img src={proj.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <span className="px-6 py-2 rounded-full glass border border-white/40 text-[10px] font-black text-white uppercase tracking-widest">Edit Spec</span>
                                      </div>
                                  </div>
                                  <div className="px-2 pb-2">
                                    <h3 className="font-bold text-xl mb-1">{proj.title}</h3>
                                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-6 line-clamp-1">{proj.stack}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-black/5">
                                        <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">ID: {proj.id.slice(0,8)}</span>
                                        <button onClick={(e) => { e.stopPropagation(); if(confirm('Purge deployment record?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="text-red-500 hover:text-red-700 transition-colors text-xs"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="glass-strong rounded-[2.5rem] border border-black/5 overflow-hidden">
                          <div className="divide-y divide-black/5">
                              {messages.map(msg => (
                                  <div key={msg.id} onClick={() => openMessageViewer(msg)} className="p-8 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-all group">
                                      <div className="flex gap-8 items-center">
                                          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-xl font-black">{msg.name[0]}</div>
                                          <div>
                                              <h4 className="font-bold text-lg mb-0.5">{msg.name}</h4>
                                              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest opacity-60">{msg.email}</p>
                                          </div>
                                      </div>
                                      <div className="text-right flex items-center gap-12">
                                          <div className="hidden lg:block">
                                              <p className="text-[10px] font-black opacity-20 uppercase tracking-widest">Received</p>
                                              <p className="text-xs font-bold text-gray-500">{msg.timestamp?.toDate().toLocaleDateString()}</p>
                                          </div>
                                          <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><i className="fas fa-chevron-right text-xs"></i></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {messages.length === 0 && <div className="p-32 text-center opacity-10"><i className="fas fa-inbox text-7xl mb-4"></i><p className="font-black uppercase tracking-[0.5em]">No transmissions</p></div>}
                      </div>
                  )}
              </div>
          )}

          {/* FULL PAGE PROJECT EDITOR */}
          {currentView === 'project-editor' && (
              <div className="p-8 md:p-16 max-w-5xl mx-auto animate-fade-up">
                  <header className="flex justify-between items-center mb-16 border-b border-black/5 pb-10">
                      <div>
                          <button onClick={() => setCurrentView('dashboard')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                              <i className="fas fa-arrow-left"></i> Return to Registry
                          </button>
                          <h1 className="text-5xl font-black tracking-tighter">{editingProject ? 'Edit Specification' : 'New Deployment'}</h1>
                      </div>
                      <div className="flex gap-4">
                          <button onClick={() => setCurrentView('dashboard')} className="px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black/5">Cancel</button>
                          <button onClick={handleSaveProject} className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all">
                              <i className="fas fa-check-circle mr-3"></i> Commit Changes
                          </button>
                      </div>
                  </header>

                  <div className="space-y-20 pb-20">
                      {/* Identity Section */}
                      <section className="space-y-12">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Subject Name</label>
                                  <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-transparent text-4xl font-black outline-none border-b-2 border-black/5 focus:border-blue-600 transition-colors py-2" placeholder="Enter Project Name..." />
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Visual Asset URL</label>
                                  <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full bg-transparent text-lg font-bold text-blue-600 outline-none border-b-2 border-black/5 focus:border-blue-600 transition-colors py-2" placeholder="https://..." />
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Live Production Link</label>
                                  <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full bg-transparent text-lg font-bold outline-none border-b border-black/10 py-2" placeholder="https://..." />
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Source Code (GitHub)</label>
                                  <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full bg-transparent text-lg font-bold outline-none border-b border-black/10 py-2" placeholder="https://github.com/..." />
                              </div>
                          </div>
                      </section>

                      {/* Technical Pillars */}
                      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                          <div className="p-10 glass-strong rounded-[2.5rem] border border-black/5">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8 flex items-center gap-3">
                                  <i className="fas fa-microchip"></i> Technology Stack
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-8">
                                  {techStackList.map(t => (
                                      <div key={t} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center gap-3 shadow-lg">
                                          {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))}><i className="fas fa-times"></i></button>
                                      </div>
                                  ))}
                              </div>
                              <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="w-full p-5 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none focus:bg-white focus:ring-4 ring-blue-500/10 transition-all" placeholder="Type tech and press Enter..." />
                          </div>

                          <div className="p-10 glass-strong rounded-[2.5rem] border border-black/5">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 mb-8 flex items-center gap-3">
                                  <i className="fas fa-award"></i> Performance Highlights
                              </h4>
                              <div className="space-y-3 mb-8">
                                  {highlightsList.map((h, i) => (
                                      <div key={i} className="p-4 rounded-xl bg-black/5 border border-black/5 flex justify-between items-center text-xs font-bold">
                                          <span className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> {h}</span>
                                          <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-500"><i className="fas fa-trash-alt"></i></button>
                                      </div>
                                  ))}
                              </div>
                              <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="w-full p-5 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none focus:bg-white focus:ring-4 ring-green-500/10 transition-all" placeholder="Type highlight and press Enter..." />
                          </div>
                      </section>

                      {/* Architecture Deep Dive */}
                      <section className="space-y-12">
                          <div className="flex items-center gap-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">Architectural Narrative</h4>
                              <div className="flex-1 h-[1px] bg-purple-600/10"></div>
                          </div>

                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Executive Summary</label>
                              <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-40 p-8 rounded-[2.5rem] bg-black/5 border border-black/5 text-xl leading-relaxed outline-none focus:bg-white transition-all shadow-inner" placeholder="High-level project story..." />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-red-500">The Problem (Challenge)</label>
                                  <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full h-64 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none focus:bg-white transition-all shadow-inner" placeholder="What technical hurdles were faced?" />
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-green-500">The Solution (Architected)</label>
                                  <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full h-64 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none focus:bg-white transition-all shadow-inner" placeholder="How was the challenge overcome?" />
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">The Results (Impact)</label>
                                  <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full h-64 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none focus:bg-white transition-all shadow-inner" placeholder="Metrics or feedback received?" />
                              </div>
                          </div>
                      </section>
                  </div>
              </div>
          )}

          {/* FULL PAGE MESSAGE VIEWER */}
          {currentView === 'message-viewer' && selectedMessage && (
              <div className="p-8 md:p-16 max-w-4xl mx-auto animate-fade-up">
                  <button onClick={() => setCurrentView('dashboard')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-12 flex items-center gap-2">
                      <i className="fas fa-arrow-left"></i> Back to Inbox
                  </button>
                  
                  <div className="glass-strong rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden border border-white/20">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                      
                      <header className="border-b border-black/5 pb-12 mb-12">
                          <h1 className="text-6xl font-black tracking-tighter mb-6">{selectedMessage.name}</h1>
                          <div className="flex flex-col md:flex-row md:items-center gap-6 text-[11px] font-black uppercase tracking-widest opacity-40">
                              <div className="flex items-center gap-2"><i className="fas fa-envelope text-blue-600"></i> {selectedMessage.email}</div>
                              <div className="hidden md:block w-1 h-1 bg-black rounded-full opacity-20"></div>
                              <div className="flex items-center gap-2"><i className="fas fa-calendar-alt text-blue-600"></i> {selectedMessage.timestamp?.toDate().toLocaleString()}</div>
                          </div>
                      </header>
                      
                      <div className="text-2xl leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                          {selectedMessage.message}
                      </div>
                      
                      <footer className="mt-20 flex flex-col sm:flex-row gap-4">
                          <a href={`mailto:${selectedMessage.email}`} className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] text-center shadow-2xl hover:bg-blue-500 transition-all">Establish Response</a>
                          <button onClick={async () => { if(confirm('Purge logs?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setCurrentView('dashboard'); } }} className="px-12 py-6 bg-red-500/10 text-red-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Purge Signal</button>
                      </footer>
                  </div>
              </div>
          )}

      </main>

    </div>
  );
};

export default Admin;