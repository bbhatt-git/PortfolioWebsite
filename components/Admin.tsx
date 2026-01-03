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
  
  const [activeTab, setActiveTab] = useState<'projects' | 'messages'>('projects');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
    } catch (err) { setError('Authentication Failed'); }
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
    setIsModalOpen(false);
  };

  if (loading) return <div className="h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center text-blue-600"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505] p-6">
      <div className="glass-strong p-12 rounded-[3rem] w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-8 text-white font-black text-2xl">BR</div>
        <h2 className="text-xl font-bold mb-8">Hub Identity Check</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none font-bold text-sm" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-all uppercase tracking-widest text-xs">Enter Hub</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#050505] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans selection:bg-blue-500/20">
      
      {/* 1. MINIMAL DASHBOARD SIDEBAR */}
      <aside className="w-20 md:w-72 glass-strong border-r border-black/5 flex flex-col shrink-0 z-50">
          <div className="p-8 pb-12">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">BR</div>
                <span className="hidden md:block font-black text-xl tracking-tight">Portfolio Admin</span>
              </div>
              <nav className="space-y-2">
                  <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-40 hover:opacity-100'}`}>
                      <i className="fas fa-grid-2 text-lg"></i>
                      <span className="hidden md:block font-bold text-sm">Deployments</span>
                  </button>
                  <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-black/5 opacity-40 hover:opacity-100'}`}>
                      <i className="fas fa-inbox text-lg"></i>
                      <span className="hidden md:block font-bold text-sm">Inbox</span>
                      {messages.length > 0 && <span className="hidden md:block ml-auto bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">{messages.length}</span>}
                  </button>
              </nav>
          </div>
          <div className="mt-auto p-8 border-t border-black/5">
              <button onClick={() => signOut(auth)} className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">Sign Out</button>
          </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
              <header className="flex justify-between items-end mb-16 animate-fade-up">
                  <div>
                      <h1 className="text-5xl font-black tracking-tighter">{activeTab === 'projects' ? 'Production Logs' : 'Incoming Signals'}</h1>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Active System Manager</p>
                      </div>
                  </div>
                  {activeTab === 'projects' && (
                    <button onClick={() => openProjectEditor()} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        <i className="fas fa-plus mr-3"></i> Add Project
                    </button>
                  )}
              </header>

              {activeTab === 'projects' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                      {projects.map(proj => (
                          <div key={proj.id} onClick={() => openProjectEditor(proj)} className="group glass-strong p-5 rounded-[2.5rem] border border-black/5 cursor-pointer hover:-translate-y-2 transition-all duration-500">
                              <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-8 border border-black/5">
                                  <img src={proj.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="px-6 py-2 rounded-full glass border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">Update Spec</span>
                                  </div>
                              </div>
                              <div className="px-2">
                                <h3 className="font-bold text-xl mb-1 truncate">{proj.title}</h3>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-8">{proj.stack}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                                    <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">ID: {proj.id.slice(0,8)}</span>
                                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Purge project?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="text-red-500 hover:text-red-700 transition-colors"><i className="fas fa-trash-alt"></i></button>
                                </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="glass-strong rounded-[3rem] border border-black/5 overflow-hidden">
                      <div className="divide-y divide-black/5">
                          {messages.map(msg => (
                              <div key={msg.id} onClick={() => setSelectedMessage(msg)} className="p-10 flex items-center justify-between cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 transition-all group">
                                  <div className="flex gap-8 items-center">
                                      <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600/10 text-blue-600 flex items-center justify-center text-2xl font-black">{msg.name[0]}</div>
                                      <div>
                                          <h4 className="font-bold text-xl mb-0.5">{msg.name}</h4>
                                          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest opacity-60">{msg.email}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">{msg.timestamp?.toDate().toLocaleDateString()}</p>
                                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><i className="fas fa-chevron-right text-[10px]"></i></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                      {messages.length === 0 && <div className="p-32 text-center opacity-10"><i className="fas fa-inbox text-7xl mb-4"></i><p className="font-black uppercase tracking-[0.5em]">Zero Activity</p></div>}
                  </div>
              )}
          </div>
      </main>

      {/* 3. MODAL: HEAVY GLASS PROJECT EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
          <div className="w-full max-w-6xl glass-strong rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
              <div className="h-16 border-b border-black/5 flex items-center px-12 shrink-0 bg-white/40 dark:bg-black/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Deployment Specification Sheet</span>
                  <button onClick={() => setIsModalOpen(false)} className="ml-auto w-10 h-10 rounded-full bg-black/5 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-16">
                  {/* Basic Metadata */}
                  <section className="space-y-8">
                      <div className="flex items-center gap-8 border-b border-black/5 pb-6">
                        <span className="text-[10px] font-black opacity-20 uppercase w-24 tracking-widest">Subject:</span>
                        <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-4xl font-black outline-none placeholder:opacity-10" placeholder="Project Title..." />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black opacity-20 uppercase tracking-widest">Thumbnail Asset URL</label>
                              <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black opacity-20 uppercase tracking-widest">Live CDN</label>
                                  <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black opacity-20 uppercase tracking-widest">Source Repo</label>
                                  <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 rounded-2xl bg-black/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                              </div>
                          </div>
                      </div>
                  </section>

                  {/* Tech Stack & Key Highlights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-black/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-8"><i className="fas fa-microchip mr-2"></i> Tech Stack</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {techStackList.map(t => (
                                <div key={t} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center gap-3 shadow-lg">
                                    {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))}><i className="fas fa-times"></i></button>
                                </div>
                            ))}
                        </div>
                        <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="w-full p-4 rounded-2xl border border-black/5 bg-white dark:bg-black text-sm font-bold outline-none" placeholder="Type tech & press Enter..." />
                      </div>

                      <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-black/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-8"><i className="fas fa-star mr-2"></i> Performance Highlights</h4>
                        <div className="space-y-2 mb-6">
                            {highlightsList.map((h, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white dark:bg-black border border-black/5 flex justify-between items-center text-xs font-bold">
                                    <span className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> {h}</span>
                                    <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-500"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            ))}
                        </div>
                        <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="w-full p-4 rounded-2xl border border-black/5 bg-white dark:bg-black text-sm font-bold outline-none" placeholder="Add bullet & press Enter..." />
                      </div>
                  </div>

                  {/* Architectural Deep Dive */}
                  <section className="space-y-10">
                      <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">Case Study Narrative</h4>
                        <div className="flex-1 h-[1px] bg-purple-500/10"></div>
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-20">Main Narrative Description</label>
                        <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-40 p-8 rounded-[2.5rem] bg-black/5 border border-black/5 text-lg leading-relaxed outline-none" placeholder="High-level project story..." />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Architecture Challenge</label>
                              <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full h-56 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none" placeholder="What technical hurdles did you face?" />
                          </div>
                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-green-500">Implemented Solution</label>
                              <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full h-56 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none" placeholder="How was it architected?" />
                          </div>
                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Technical Results</label>
                              <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full h-56 p-6 rounded-[2rem] bg-black/5 border border-black/5 text-sm font-bold leading-relaxed outline-none" placeholder="Metrics, performance, or results?" />
                          </div>
                      </div>
                  </section>
              </div>

              <div className="p-10 border-t border-black/5 bg-white/40 dark:bg-black/20 flex justify-end gap-5 shrink-0">
                  <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 rounded-2xl hover:bg-black/5 font-black text-[10px] uppercase tracking-widest opacity-40">Discard Draft</button>
                  <button onClick={handleSaveProject} className="px-16 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-500 transition-all">
                    Commit & Deploy
                  </button>
              </div>
          </div>
        </div>
      )}

      {/* MODAL: MESSAGE VIEWER */}
      {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
              <div className="w-full max-w-3xl glass-strong rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
                  <div className="p-14 space-y-12 overflow-y-auto">
                      <div className="border-b border-black/5 pb-12">
                          <h2 className="text-5xl font-black tracking-tighter mb-8">{selectedMessage.name}</h2>
                          <div className="space-y-2 text-xs font-black uppercase tracking-widest opacity-40">
                              <div>From: <span className="text-blue-600 lowercase">{selectedMessage.email}</span></div>
                              <div>Recorded: {selectedMessage.timestamp?.toDate().toLocaleString()}</div>
                          </div>
                      </div>
                      <div className="text-2xl leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                          {selectedMessage.message}
                      </div>
                      <div className="pt-12 flex gap-5">
                          <a href={`mailto:${selectedMessage.email}`} className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] text-center shadow-2xl hover:bg-blue-500 transition-all">Establish Reply</a>
                          <button onClick={async () => { if(confirm('Purge transmission?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setSelectedMessage(null); } }} className="px-12 py-6 bg-red-500/10 text-red-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Purge</button>
                          <button onClick={() => setSelectedMessage(null)} className="px-10 py-6 bg-black/5 rounded-[2rem] font-black text-xs uppercase tracking-widest">Close</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Admin;