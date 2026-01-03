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
  
  // macOS Desktop State
  const [openWindows, setOpenWindows] = useState<string[]>(['inbox']); // Which windows are active
  const [focusedWindow, setFocusedWindow] = useState<string>('inbox');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  
  // Project Editor (Compose Window) State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
  const [caseStudyForm, setCaseStudyForm] = useState({ challenge: '', solution: '', results: '' });
  
  // Tag/List Systems State
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
    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMessages(msgs);
    if (msgs.length > 0) setSelectedMessage(msgs[0]);
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
      setError('Invalid system credentials.');
    }
  };

  const toggleWindow = (id: string) => {
    if (openWindows.includes(id)) {
      setOpenWindows(openWindows.filter(w => w !== id));
    } else {
      setOpenWindows([...openWindows, id]);
      setFocusedWindow(id);
    }
  };

  const openCompose = (proj?: Project) => {
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
    setIsComposeOpen(true);
  };

  const addTech = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = techInput.trim();
    if (val && !techStackList.includes(val)) {
      setTechStackList([...techStackList, val]);
      setTechInput('');
    }
  };

  const addHighlight = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = highlightInput.trim();
    if (val) {
      setHighlightsList([...highlightsList, val]);
      setHighlightInput('');
    }
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Title and Tech Stack are mandatory.");
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
      setIsComposeOpen(false);
    } catch (err) { alert("Failed to deploy project."); }
  };

  const WindowFrame = ({ id, title, children, className = "" }: any) => (
    <div 
      onClick={() => setFocusedWindow(id)}
      className={`absolute glass-strong rounded-2xl shadow-2xl border border-white/20 flex flex-col transition-all duration-300 animate-scale-in ${
        focusedWindow === id ? 'z-40 scale-100 opacity-100' : 'z-30 scale-[0.98] opacity-80'
      } ${className}`}
    >
      <div className="h-10 bg-white/40 dark:bg-black/20 backdrop-blur-md flex items-center px-4 shrink-0 border-b border-black/5 dark:border-white/5 cursor-default">
        <div className="flex gap-1.5">
          <div onClick={() => toggleWindow(id)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:brightness-90"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{title}</span>
        </div>
        <div className="w-12"></div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-500"><i className="fas fa-circle-notch fa-spin text-4xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 font-sans">
      <div className="glass-strong p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/20 text-center animate-scale-in">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-8 text-white font-black text-2xl">BR</div>
        <h1 className="text-xl font-bold mb-8">Administrator Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="System ID" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none focus:ring-2 ring-blue-500/20 text-sm font-bold" />
          <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none focus:ring-2 ring-blue-500/20 text-sm font-bold" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">Authorize Session</button>
        </form>
        {error && <p className="text-red-500 text-xs mt-6 font-bold uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full relative bg-[#F2F2F7] dark:bg-[#050505] overflow-hidden flex flex-col font-sans select-none">
      
      {/* 1. TOP MENU BAR */}
      <div className="h-7 w-full bg-white/30 dark:bg-black/20 backdrop-blur-xl border-b border-black/5 flex items-center px-4 justify-between text-[11px] font-bold z-[100]">
          <div className="flex items-center gap-5">
              <i className="fab fa-apple text-sm"></i>
              <span className="font-black">Portfolio OS</span>
              <span className="opacity-40 hover:opacity-100 cursor-default">File</span>
              <span className="opacity-40 hover:opacity-100 cursor-default">Edit</span>
              <span className="opacity-40 hover:opacity-100 cursor-default">View</span>
              <span className="opacity-40 hover:opacity-100 cursor-default">Go</span>
              <span className="opacity-40 hover:opacity-100 cursor-default">Window</span>
          </div>
          <div className="flex items-center gap-5">
              <span className="opacity-60">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <i className="fas fa-wifi opacity-60"></i>
              <i className="fas fa-search opacity-60"></i>
              <button onClick={() => signOut(auth)} className="text-red-500 hover:opacity-80 transition-opacity">Disconnect</button>
          </div>
      </div>

      {/* 2. DESKTOP WORKSPACE */}
      <main className="flex-1 relative overflow-hidden p-6">
          
          {/* WINDOW: INBOX (Mail App) */}
          {openWindows.includes('inbox') && (
            <WindowFrame id="inbox" title="Mail — Inbox" className="w-full max-w-4xl h-[70vh] left-1/2 top-[10%] -translate-x-1/2">
                <div className="flex h-full">
                    {/* List Pane */}
                    <div className="w-80 border-r border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 shrink-0 overflow-y-auto custom-scrollbar">
                        {messages.map(msg => (
                            <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-5 border-b border-black/5 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-blue-600/10' : 'hover:bg-white/50'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm truncate pr-2">{msg.name}</span>
                                    <span className="text-[9px] opacity-40">{msg.timestamp?.toDate().toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mb-1">{msg.email}</p>
                                <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                    {/* Content Pane */}
                    <div className="flex-1 bg-white dark:bg-[#121212] flex flex-col overflow-y-auto custom-scrollbar p-10">
                        {selectedMessage ? (
                            <div className="animate-fade-up">
                                <div className="border-b border-black/5 pb-8 mb-8">
                                    <h2 className="text-4xl font-black tracking-tighter mb-6">{selectedMessage.name}</h2>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex gap-4"><span className="opacity-40 w-14 font-black uppercase text-[9px]">From:</span> <span className="font-bold text-blue-600">{selectedMessage.email}</span></div>
                                        <div className="flex gap-4"><span className="opacity-40 w-14 font-black uppercase text-[9px]">To:</span> <span className="opacity-40">Admin &lt;bhupesh@bbhatt.com.np&gt;</span></div>
                                        <div className="flex gap-4"><span className="opacity-40 w-14 font-black uppercase text-[9px]">Date:</span> <span className="opacity-40">{selectedMessage.timestamp?.toDate().toLocaleString()}</span></div>
                                    </div>
                                </div>
                                <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                                <i className="fas fa-envelope-open-text text-9xl"></i>
                                <span className="mt-4 font-bold">No message selected</span>
                            </div>
                        )}
                    </div>
                </div>
            </WindowFrame>
          )}

          {/* WINDOW: PROJECTS (Finder Style) */}
          {openWindows.includes('projects') && (
            <WindowFrame id="projects" title="Finder — Deployments" className="w-full max-w-5xl h-[75vh] left-1/2 top-[12%] -translate-x-1/2 translate-y-4">
                <div className="bg-white/40 dark:bg-black/20 p-4 border-b border-black/5 flex justify-between items-center shrink-0">
                    <div className="flex gap-4">
                        <i className="fas fa-chevron-left opacity-30"></i>
                        <i className="fas fa-chevron-right opacity-30"></i>
                        <span className="text-[11px] font-bold opacity-60">All Projects</span>
                    </div>
                    <button onClick={() => openCompose()} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-xl flex items-center gap-2 hover:bg-blue-500"><i className="fas fa-plus"></i> New deployment</button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 custom-scrollbar">
                    {projects.map(proj => (
                        <div key={proj.id} onClick={() => openCompose(proj)} className="group glass p-4 rounded-2xl border border-black/5 cursor-pointer hover:scale-[1.02] transition-all hover:bg-white/80 dark:hover:bg-white/5">
                            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-black/5">
                                <img src={proj.image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black text-white border border-white/30 uppercase tracking-widest">Open Editor</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-sm mb-1 truncate">{proj.title}</h4>
                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest truncate">{proj.stack}</p>
                            <div className="mt-4 flex justify-end">
                                <button onClick={(e) => { e.stopPropagation(); if(confirm('Erase this deployment?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="text-red-500 text-xs opacity-0 group-hover:opacity-100 hover:scale-125 transition-all"><i className="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </WindowFrame>
          )}

          {/* OVERLAY: COMPOSE WINDOW (Project Form) */}
          {isComposeOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                <div className="w-full max-w-4xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden flex flex-col h-[90vh] animate-scale-in">
                    
                    {/* Compose Header */}
                    <div className="h-14 bg-[#F2F2F7] dark:bg-black/40 border-b border-black/5 flex items-center px-6 justify-between shrink-0">
                        <div className="flex gap-2">
                           <div onClick={() => setIsComposeOpen(false)} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer"></div>
                           <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                           <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">New Project Specification</span>
                        <div className="w-12"></div>
                    </div>

                    {/* Metadata Section (To/Subject Style) */}
                    <div className="px-10 py-6 border-b border-black/5 bg-white dark:bg-transparent">
                        <div className="space-y-4">
                            <div className="flex items-center gap-6 border-b border-black/5 pb-3">
                                <span className="text-[10px] font-black opacity-30 uppercase w-20">To:</span>
                                <div className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-600/20">Production Portfolio</div>
                            </div>
                            <div className="flex items-center gap-6 border-b border-black/5 pb-3">
                                <span className="text-[10px] font-black opacity-30 uppercase w-20">Subject:</span>
                                <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-xl font-bold outline-none placeholder:opacity-20" placeholder="A Strategic Digital Transformation..." />
                            </div>
                        </div>
                    </div>

                    {/* Main Form Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                        
                        {/* 1. TECH PILL SYSTEM */}
                        <div className="p-8 rounded-[2rem] bg-[#F2F2F7] dark:bg-white/5 border border-black/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><i className="fas fa-microchip text-blue-500"></i> Technical Architecture</h4>
                            <div className="flex flex-wrap gap-2.5 mb-6">
                                {techStackList.map(t => (
                                    <div key={t} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-bold flex items-center gap-3 shadow-lg group">
                                        {t} 
                                        <button onClick={() => setTechStackList(techStackList.filter(item => item !== t))} className="hover:text-red-200"><i className="fas fa-times"></i></button>
                                    </div>
                                ))}
                                {techStackList.length === 0 && <span className="text-xs opacity-30 italic">No technologies defined...</span>}
                            </div>
                            <div className="flex gap-3">
                                <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTech(e)} className="flex-1 bg-white dark:bg-white/5 p-4 rounded-xl border border-black/5 text-sm font-bold outline-none" placeholder="Type tech name (e.g. Next.js, Python) and press Enter..." />
                                <button onClick={addTech} className="px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Inject</button>
                            </div>
                        </div>

                        {/* 2. HIGHLIGHTS SYSTEM */}
                        <div className="p-8 rounded-[2rem] bg-[#F2F2F7] dark:bg-white/5 border border-black/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><i className="fas fa-award text-yellow-500"></i> Key Achievements & Performance</h4>
                            <div className="space-y-3 mb-6">
                                {highlightsList.map((h, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-black/5 text-sm flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-[10px]"><i className="fas fa-check"></i></div>
                                            <span className="font-medium">{h}</span>
                                        </div>
                                        <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                ))}
                                {highlightsList.length === 0 && <span className="text-xs opacity-30 italic">No highlights recorded...</span>}
                            </div>
                            <div className="flex gap-3">
                                <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHighlight(e)} className="flex-1 bg-white dark:bg-white/5 p-4 rounded-xl border border-black/5 text-sm font-bold outline-none" placeholder="Add achievement (e.g. Boosted SEO by 80%) and press Enter..." />
                                <button onClick={addHighlight} className="px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Push</button>
                            </div>
                        </div>

                        {/* 3. ASSET LOGISTICS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30">CDN Image URL</label>
                                <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Production Link</label>
                                    <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Repository Link</label>
                                    <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 text-sm font-bold outline-none" placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        {/* 4. PROJECT NARRATIVE */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Primary Narrative / Description</label>
                            <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-40 p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5 text-lg leading-relaxed outline-none" placeholder="The mission behind this deployment..." />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Architecture Challenge</label>
                                    <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-xs font-bold leading-relaxed outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-green-500 uppercase tracking-widest">Implemented Solution</label>
                                    <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-xs font-bold leading-relaxed outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Technical Results</label>
                                    <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-xs font-bold leading-relaxed outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compose Footer Actions */}
                    <div className="p-8 border-t border-black/5 bg-white dark:bg-black/40 flex justify-end gap-4 shrink-0">
                        <button onClick={() => setIsComposeOpen(false)} className="px-8 py-3 rounded-xl hover:bg-black/5 font-black text-[10px] uppercase tracking-widest">Discard Draft</button>
                        <button onClick={handleSaveProject} className="px-12 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-500 flex items-center gap-3">
                            <i className="fas fa-paper-plane"></i> Deploy Signal
                        </button>
                    </div>
                </div>
            </div>
          )}

      </main>

      {/* 3. DESKTOP DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 z-[100] group">
          <button 
            onClick={() => toggleWindow('inbox')} 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 relative group/btn ${openWindows.includes('inbox') ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-black/5 dark:bg-white/5 hover:scale-110'}`}
          >
              <i className="fas fa-envelope"></i>
              <span className="absolute -top-12 px-3 py-1 bg-black text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Mail Inbox</span>
              {openWindows.includes('inbox') && <div className="absolute -bottom-1 w-1 h-1 bg-black/50 dark:bg-white/50 rounded-full"></div>}
          </button>
          <button 
            onClick={() => toggleWindow('projects')} 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 relative group/btn ${openWindows.includes('projects') ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-black/5 dark:bg-white/5 hover:scale-110'}`}
          >
              <i className="fas fa-folder"></i>
              <span className="absolute -top-12 px-3 py-1 bg-black text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Deployments</span>
              {openWindows.includes('projects') && <div className="absolute -bottom-1 w-1 h-1 bg-black/50 dark:bg-white/50 rounded-full"></div>}
          </button>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-2"></div>
          <button 
            onClick={() => openCompose()} 
            className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-white/10 text-blue-600 flex items-center justify-center text-2xl hover:scale-110 transition-all shadow-lg relative group/btn"
          >
              <i className="fas fa-plus"></i>
              <span className="absolute -top-12 px-3 py-1 bg-black text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Compose New</span>
          </button>
      </div>

    </div>
  );
};

export default Admin;