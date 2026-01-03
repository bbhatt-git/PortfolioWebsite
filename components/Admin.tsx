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
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    } catch (err) { setError('Access Restricted'); }
  };

  const openProjectEditor = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({ title: proj.title, desc: proj.desc, liveUrl: proj.liveUrl || '', codeUrl: proj.codeUrl || '', imageUrl: proj.image });
      setCaseStudyForm({ 
        challenge: proj.caseStudy?.challenge || '', 
        solution: proj.caseStudy?.solution || '', 
        results: proj.caseStudy?.results || '' 
      });
      setTechStackList(proj.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean));
      setHighlightsList(proj.highlights || []);
    } else {
      setEditingProject(null);
      setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
      setCaseStudyForm({ challenge: '', solution: '', results: '' });
      setTechStackList([]);
      setHighlightsList([]);
    }
    setIsModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Title and Technologies are mandatory.");
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
      setIsModalOpen(false);
    } catch (err) { alert("Failed to save changes."); }
  };

  if (loading) return <div className="h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center text-blue-600"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 font-sans">
      <div className="glass-strong p-12 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 text-white font-black text-2xl">BR</div>
        <h2 className="text-xl font-bold mb-8">Admin Access</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 active:scale-95 transition-all">Authorize Session</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#050505] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans selection:bg-blue-500/20">
      
      {/* 1. PROFESSIONAL SIDEBAR */}
      <aside className="w-20 md:w-64 glass-strong border-r border-black/5 flex flex-col shrink-0 z-50">
          <div className="p-8 pb-12">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg mb-8">BR</div>
              <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
                  >
                      <i className="fas fa-layer-group"></i>
                      <span className="hidden md:block font-bold text-sm">Projects</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-50 hover:opacity-100'}`}
                  >
                      <i className="fas fa-envelope"></i>
                      <span className="hidden md:block font-bold text-sm">Inbox</span>
                  </button>
              </nav>
          </div>
          <div className="mt-auto p-8">
              <button onClick={() => signOut(auth)} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Sign Out</button>
          </div>
      </aside>

      {/* 2. DASHBOARD CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar relative">
          <div className="max-w-6xl mx-auto">
              <header className="flex justify-between items-end mb-16 animate-fade-up">
                  <div>
                      <h1 className="text-5xl font-black tracking-tighter">{activeTab === 'projects' ? 'Portfolio Deployments' : 'Signals & Inquiries'}</h1>
                      <p className="text-gray-500 mt-2 font-medium">System Management Interface v3.0</p>
                  </div>
                  {activeTab === 'projects' && (
                    <button onClick={() => openProjectEditor()} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                        <i className="fas fa-plus mr-2"></i> New Project
                    </button>
                  )}
              </header>

              {activeTab === 'projects' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up">
                      {projects.map(proj => (
                          <div key={proj.id} onClick={() => openProjectEditor(proj)} className="group glass-strong p-4 rounded-3xl border border-black/5 cursor-pointer hover:-translate-y-2 transition-all duration-500">
                              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-black/5">
                                  <img src={proj.image} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-[10px] font-black text-white uppercase tracking-widest border border-white/40 px-4 py-2 rounded-full">Edit Spec</span>
                                  </div>
                              </div>
                              <h3 className="font-bold text-lg mb-1 truncate">{proj.title}</h3>
                              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-6">{proj.stack}</p>
                              <div className="flex justify-between items-center border-t border-black/5 pt-4">
                                  <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">ID: {proj.id.slice(0, 8)}</span>
                                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete Project?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-trash-alt"></i></button>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="space-y-4 animate-fade-up">
                      {messages.map(msg => (
                          <div key={msg.id} onClick={() => setSelectedMessage(msg)} className="glass-strong p-6 rounded-2xl border border-black/5 flex items-center justify-between cursor-pointer hover:bg-white/80 dark:hover:bg-white/5 transition-all group">
                              <div className="flex gap-6 items-center">
                                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-lg font-black">{msg.name[0]}</div>
                                  <div>
                                      <h4 className="font-bold">{msg.name}</h4>
                                      <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">{msg.email}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">{msg.timestamp?.toDate().toLocaleDateString()}</span>
                                  <div className="text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest mt-1">Open Message</div>
                              </div>
                          </div>
                      ))}
                      {messages.length === 0 && <div className="text-center py-20 opacity-20"><i className="fas fa-inbox text-5xl mb-4"></i><p className="font-black uppercase tracking-[0.4em]">Empty Inbox</p></div>}
                  </div>
              )}
          </div>
      </main>

      {/* 3. PROJECT EDITOR MODAL (Pure Dashboard Modal) */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="w-full max-w-5xl bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                  
                  {/* Modal Header */}
                  <div className="h-16 bg-[#F2F2F7] dark:bg-black/20 border-b border-black/5 flex items-center px-10 shrink-0">
                      <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Project Specification Sheet</h2>
                      <button onClick={() => setIsModalOpen(false)} className="ml-auto w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-times"></i></button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                      
                      {/* Basic Info */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-6 border-b border-black/5 pb-4">
                            <span className="text-[10px] font-black opacity-20 uppercase w-24">Subject:</span>
                            <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-3xl font-black outline-none placeholder:opacity-10" placeholder="Project Name..." />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black opacity-20 uppercase tracking-widest">Image Asset URL</label>
                                <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-20 uppercase tracking-widest">Live Preview</label>
                                    <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-20 uppercase tracking-widest">Repository</label>
                                    <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                                </div>
                             </div>
                        </div>
                      </section>

                      {/* Tech & Highlights */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          {/* Tech Pillar System */}
                          <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 flex items-center gap-3"><i className="fas fa-microchip"></i> Technical Stack</h4>
                              <div className="flex flex-wrap gap-2 min-h-[50px] p-4 rounded-2xl bg-black/5 border border-black/5">
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
                                className="w-full p-4 rounded-xl border border-black/5 bg-white dark:bg-black text-sm font-bold outline-none" 
                                placeholder="Add technology (Enter)..." 
                              />
                          </div>

                          {/* Highlights List System */}
                          <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 flex items-center gap-3"><i className="fas fa-bolt"></i> Key Highlights</h4>
                              <div className="space-y-2 p-4 rounded-2xl bg-black/5 border border-black/5">
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
                                className="w-full p-4 rounded-xl border border-black/5 bg-white dark:bg-black text-sm font-bold outline-none" 
                                placeholder="Add bullet point (Enter)..." 
                              />
                          </div>
                      </div>

                      {/* Case Study Section (AS REQUESTED) */}
                      <div className="space-y-10">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600 border-b border-purple-600/10 pb-4">Architectural Narrative</h4>
                          
                          <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Primary Description</label>
                              <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-32 p-6 rounded-3xl bg-black/5 border border-black/5 text-lg leading-relaxed outline-none" placeholder="The high-level story..." />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Architecture Challenge</label>
                                  <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full h-48 p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none" placeholder="What technical hurdles did you face?" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-green-500">Implemented Solution</label>
                                  <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full h-48 p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none" placeholder="How was the hurdle overcome?" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Technical Results</label>
                                  <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full h-48 p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none" placeholder="Metrics, performance, or feedback?" />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 border-t border-black/5 bg-gray-50 dark:bg-black/20 flex justify-end gap-4 shrink-0">
                      <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-xl hover:bg-black/5 font-black text-[10px] uppercase tracking-widest">Discard</button>
                      <button onClick={handleSaveProject} className="px-12 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-500 transition-all">
                        Commit & Deploy Signal
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MESSAGE VIEWER MODAL */}
      {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
                  <div className="h-14 bg-white/40 dark:bg-black/20 border-b border-black/5 flex items-center px-8 shrink-0 relative">
                      <div className="flex gap-2">
                        <div onClick={() => setSelectedMessage(null)} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Transmission Data</span>
                      </div>
                  </div>
                  <div className="p-10 md:p-14 space-y-10 overflow-y-auto">
                      <div className="border-b border-black/5 pb-10">
                          <h2 className="text-4xl font-black tracking-tight mb-8">{selectedMessage.name}</h2>
                          <div className="space-y-2 text-xs font-black uppercase tracking-widest opacity-40">
                              <div>From: <span className="text-blue-600 lowercase">{selectedMessage.email}</span></div>
                              <div>Date: {selectedMessage.timestamp?.toDate().toLocaleString()}</div>
                          </div>
                      </div>
                      <div className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                          {selectedMessage.message}
                      </div>
                      <div className="pt-10 flex gap-4">
                          <a href={`mailto:${selectedMessage.email}`} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-xl">Secure Reply</a>
                          <button onClick={async () => { if(confirm('Purge logs?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setSelectedMessage(null); } }} className="px-10 py-5 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest">Purge</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Admin;