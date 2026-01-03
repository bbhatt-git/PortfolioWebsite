import React, { useState, useEffect, useRef } from 'react';
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
  
  // Windows Management
  const [windows, setWindows] = useState<{ id: string; type: 'inbox' | 'projects' | 'message' | 'compose'; data?: any; zIndex: number }[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);

  // Data
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Project Form State (Compose)
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
  const [caseStudyForm, setCaseStudyForm] = useState({ challenge: '', solution: '', results: '' });
  const [techInput, setTechInput] = useState('');
  const [techStackList, setTechStackList] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  const [highlightsList, setHighlightsList] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const openWindow = (type: 'inbox' | 'projects' | 'message' | 'compose', data?: any) => {
    const id = `${type}-${data?.id || 'new'}-${Date.now()}`;
    // Check if inbox or projects window already exists
    if (type === 'inbox' || type === 'projects') {
        const existing = windows.find(w => w.type === type);
        if (existing) {
            setActiveWindow(existing.id);
            return;
        }
    }
    
    setWindows(prev => [...prev, { id, type, data, zIndex: nextZIndex }]);
    setActiveWindow(id);
    setNextZIndex(prev => prev + 1);

    if (type === 'compose') {
        if (data) {
            setEditingId(data.id);
            setProjectForm({ title: data.title, desc: data.desc, liveUrl: data.liveUrl || '', codeUrl: data.codeUrl || '', imageUrl: data.image });
            setCaseStudyForm({ challenge: data.caseStudy?.challenge || '', solution: data.caseStudy?.solution || '', results: data.caseStudy?.results || '' });
            setTechStackList(data.stack.split(/[•,]/).map((s: string) => s.trim()).filter(Boolean));
            setHighlightsList(data.highlights || []);
        } else {
            setEditingId(null);
            setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
            setCaseStudyForm({ challenge: '', solution: '', results: '' });
            setTechStackList([]);
            setHighlightsList([]);
        }
    }
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindow === id) setActiveWindow(null);
  };

  const handleSaveProject = async (windowId: string) => {
    if (!projectForm.title || techStackList.length === 0) return alert("Subject and Tech required.");
    const data = {
      ...projectForm,
      image: projectForm.imageUrl || 'https://via.placeholder.com/1200x800',
      stack: techStackList.join(' • '),
      highlights: highlightsList,
      caseStudy: caseStudyForm,
      order: editingId ? projects.find(p => p.id === editingId)?.order : projects.length
    };
    if (editingId) await updateDoc(doc(db, "projects", editingId), data);
    else await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
    fetchProjects();
    closeWindow(windowId);
  };

  const WindowHeader = ({ id, title }: { id: string, title: string }) => (
    <div className="h-10 bg-white/60 dark:bg-black/40 border-b border-black/5 flex items-center px-4 shrink-0 relative group">
      <div className="flex gap-2 relative z-10">
        <div onClick={(e) => { e.stopPropagation(); closeWindow(id); }} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:brightness-90"></div>
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
        <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{title}</span>
      </div>
    </div>
  );

  if (loading) return <div className="h-screen bg-[#F2F2F7] flex items-center justify-center text-blue-600"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6">
      <div className="glass-strong p-10 rounded-[2rem] w-full max-w-xs shadow-2xl border border-white/20 text-center animate-scale-in">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-8 text-white font-black text-xl">BR</div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="System ID" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none text-sm font-bold" />
          <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none text-sm font-bold" />
          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">Authorize</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-4 font-black uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full relative bg-[#F2F2F7] dark:bg-[#050505] overflow-hidden flex flex-col font-sans select-none">
      
      {/* 1. STATUS BAR */}
      <div className="h-7 w-full bg-white/20 dark:bg-black/20 backdrop-blur-xl flex items-center px-4 justify-between border-b border-black/5 text-[11px] font-bold z-[1000]">
        <div className="flex items-center gap-5">
          <i className="fab fa-apple text-sm"></i>
          <span className="font-black">Portfolio OS</span>
          <span className="opacity-40">System</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-60">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <button onClick={() => signOut(auth)} className="text-red-500">Log Out</button>
        </div>
      </div>

      {/* 2. DESKTOP WORKSPACE */}
      <main className="flex-1 relative overflow-hidden p-6 bg-[url('https://www.apple.com/v/macos/sequoia/a/images/overview/hero/wallpaper__e63kpsk0s7m6_large_2x.jpg')] bg-cover bg-center">
        
        {windows.map((win) => (
          <div 
            key={win.id}
            onClick={() => setActiveWindow(win.id)}
            style={{ zIndex: win.zIndex }}
            className={`absolute flex flex-col rounded-2xl shadow-2xl border border-white/20 overflow-hidden glass-strong transition-all duration-300 animate-scale-in ${
              win.type === 'inbox' ? 'w-[400px] h-[500px] left-10 top-10' :
              win.type === 'projects' ? 'w-[500px] h-[400px] left-20 top-20' :
              win.type === 'message' ? 'w-[600px] h-[70vh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' :
              'w-[800px] h-[85vh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            } ${activeWindow === win.id ? 'opacity-100 scale-100' : 'opacity-80 scale-[0.98]'}`}
          >
            <WindowHeader id={win.id} title={win.type === 'message' ? `Mail — ${win.data.name}` : win.type === 'compose' ? 'Compose — Project' : win.type} />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#1C1C1E]">
                {win.type === 'inbox' && (
                    <div className="divide-y divide-black/5">
                        {messages.map(msg => (
                            <div key={msg.id} onClick={() => openWindow('message', msg)} className="p-4 hover:bg-blue-600/5 cursor-pointer transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">{msg.name}</span>
                                    <span className="text-[9px] opacity-40">{msg.timestamp?.toDate().toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] opacity-60 truncate">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {win.type === 'projects' && (
                    <div className="p-4 grid grid-cols-2 gap-4">
                        {projects.map(proj => (
                            <div key={proj.id} onClick={() => openWindow('compose', proj)} className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 cursor-pointer hover:bg-black/10 transition-all">
                                <img src={proj.image} className="w-full aspect-video rounded-lg object-cover mb-2" />
                                <h4 className="font-bold text-xs truncate">{proj.title}</h4>
                                <div className="flex justify-between mt-2">
                                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Erase?')) deleteDoc(doc(db, "projects", proj.id)).then(fetchProjects); }} className="text-red-500 text-[10px] uppercase font-black">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {win.type === 'message' && (
                    <div className="p-10 space-y-8 animate-fade-up">
                        <div className="border-b border-black/5 pb-8">
                            <h2 className="text-4xl font-black mb-6">{win.data.name}</h2>
                            <div className="space-y-2 text-xs opacity-50 font-bold uppercase tracking-widest">
                                <div>From: <span className="text-blue-600 lowercase">{win.data.email}</span></div>
                                <div>Date: {win.data.timestamp?.toDate().toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {win.data.message}
                        </div>
                        <div className="pt-10 flex justify-end">
                            <a href={`mailto:${win.data.email}`} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl">Reply</a>
                        </div>
                    </div>
                )}

                {win.type === 'compose' && (
                    <div className="flex flex-col h-full">
                        <div className="p-8 border-b border-black/5 bg-gray-50 dark:bg-transparent">
                            <div className="space-y-4">
                                <div className="flex items-center gap-6 border-b border-black/5 pb-3">
                                    <span className="text-[10px] font-black opacity-30 uppercase w-20">Subject:</span>
                                    <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-xl font-bold outline-none" placeholder="Project Name..." />
                                </div>
                                <div className="flex items-center gap-6 border-b border-black/5 pb-3">
                                    <span className="text-[10px] font-black opacity-30 uppercase w-20">CDN URL:</span>
                                    <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="flex-1 bg-transparent text-sm font-bold outline-none" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-10 space-y-12 overflow-y-auto">
                            {/* Tech Stack Pills */}
                            <section className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                                <h4 className="text-[10px] font-black uppercase mb-4 text-blue-600">Tech Arsenal</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {techStackList.map(t => (
                                        <div key={t} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black flex items-center gap-2">
                                            {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))}><i className="fas fa-times"></i></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-3 rounded-xl border border-black/5 bg-white text-xs outline-none" placeholder="Enter tech..." />
                                </div>
                            </section>
                            {/* Highlights */}
                            <section className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                                <h4 className="text-[10px] font-black uppercase mb-4 text-yellow-600">Highlights</h4>
                                <div className="space-y-2 mb-4">
                                    {highlightsList.map((h, i) => (
                                        <div key={i} className="p-3 bg-white dark:bg-black rounded-xl border border-black/5 flex justify-between items-center text-xs">
                                            <span>{h}</span>
                                            <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-500"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="flex-1 p-3 rounded-xl border border-black/5 bg-white text-xs outline-none" placeholder="Add highlight..." />
                                </div>
                            </section>
                            <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-32 p-4 rounded-xl bg-black/5 border border-black/5 outline-none text-sm" placeholder="Description..." />
                        </div>
                        <div className="p-6 border-t border-black/5 flex justify-end gap-3 shrink-0">
                            <button onClick={() => closeWindow(win.id)} className="px-6 py-2 text-xs font-black uppercase tracking-widest opacity-40">Discard</button>
                            <button onClick={() => handleSaveProject(win.id)} className="px-10 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl tracking-widest">Deploy</button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        ))}

      </main>

      {/* 3. DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 glass-strong rounded-3xl shadow-2xl border border-white/40 z-[2000]">
        <button onClick={() => openWindow('inbox')} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 active:scale-95 transition-all">
          <i className="fas fa-envelope"></i>
        </button>
        <button onClick={() => openWindow('projects')} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all border border-white/20">
          <i className="fas fa-folder-open"></i>
        </button>
        <div className="w-px h-10 bg-black/10 mx-1"></div>
        <button onClick={() => openWindow('compose')} className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-95 transition-all shadow-lg">
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default Admin;