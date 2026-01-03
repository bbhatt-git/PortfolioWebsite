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
  
  // Windows & Navigation
  const [activeWindow, setActiveWindow] = useState<'inbox' | 'projects' | null>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Selection
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, projectId: string | null}>({ isOpen: false, projectId: null });
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Invalid Access Credentials.');
    }
  };

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

  // Tag Management
  const addTech = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (techInput.trim() && !techStackList.includes(techInput.trim())) {
      setTechStackList([...techStackList, techInput.trim()]);
      setTechInput('');
    }
  };

  const addHighlight = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (highlightInput.trim()) {
      setHighlightsList([...highlightsList, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({ title: proj.title, desc: proj.desc, liveUrl: proj.liveUrl || '', codeUrl: proj.codeUrl || '', imageUrl: proj.image });
    setCaseStudyForm({ challenge: proj.caseStudy?.challenge || '', solution: proj.caseStudy?.solution || '', results: proj.caseStudy?.results || '' });
    setTechStackList(proj.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean));
    setHighlightsList(proj.highlights || []);
    setIsComposeOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Subject (Title) and at least one Tech required.");
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
      closeCompose();
    } catch (err) { alert("Deployment failed."); }
  };

  const closeCompose = () => {
    setIsComposeOpen(false);
    setEditingProject(null);
    setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
    setTechStackList([]); setHighlightsList([]);
  };

  const WindowFrame = ({ title, children, onClose, className = "" }: any) => (
    <div className={`glass-strong rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-scale-in ${className}`}>
        <div className="h-10 bg-white/40 dark:bg-black/20 flex items-center px-4 shrink-0 justify-between select-none">
            <div className="flex gap-1.5">
                <div onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:brightness-90"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
            </div>
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{title}</span>
            <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );

  if (loading) return <div className="h-screen bg-[#F2F2F7] dark:bg-[#050505] flex items-center justify-center"><i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6">
        <WindowFrame title="Login Access" onClose={() => window.location.hash = ''} className="w-full max-w-sm">
            <div className="p-10 space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-white font-bold text-xl">BR</div>
                    <h1 className="text-xl font-bold">Administrator</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none" />
                    <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-all">Authenticate</button>
                </form>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </div>
        </WindowFrame>
    </div>
  );

  return (
    <div className="h-screen w-full relative bg-[#F2F2F7] dark:bg-[#050505] overflow-hidden flex flex-col">
      
      {/* 1. TOP STATUS BAR (macOS Style) */}
      <div className="h-7 w-full bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center px-4 justify-between border-b border-black/5 text-[11px] font-bold z-50">
          <div className="flex items-center gap-4">
              <i className="fab fa-apple text-sm"></i>
              <span className="font-black">Bhupesh</span>
              <button onClick={() => setActiveWindow('inbox')} className="opacity-60 hover:opacity-100">Inbox</button>
              <button onClick={() => setActiveWindow('projects')} className="opacity-60 hover:opacity-100">Deployments</button>
          </div>
          <div className="flex items-center gap-4">
              <span className="opacity-60">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <button onClick={() => signOut(auth)} className="text-red-500">Log Out</button>
          </div>
      </div>

      {/* 2. DESKTOP AREA */}
      <main className="flex-1 relative p-6 md:p-10 overflow-hidden">
          
          {/* WINDOW: INBOX (The "Email" system) */}
          {activeWindow === 'inbox' && (
            <WindowFrame title="Mail — Inbox" onClose={() => setActiveWindow(null)} className="absolute inset-4 md:inset-10 lg:inset-20 z-10">
               <div className="flex h-full">
                  {/* Left List */}
                  <div className="w-80 bg-white/40 dark:bg-black/20 border-r border-black/5 flex flex-col shrink-0">
                      <div className="p-4 border-b border-black/5 flex justify-between items-center">
                          <span className="text-[10px] font-black opacity-30 tracking-widest uppercase">Inbox</span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                         {messages.map(msg => (
                            <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-4 border-b border-black/5 cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-blue-600/10' : 'hover:bg-white/40'}`}>
                               <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-sm truncate">{msg.name}</span>
                                  <span className="text-[9px] opacity-40">{msg.timestamp?.toDate().toLocaleDateString()}</span>
                               </div>
                               <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mb-1">{msg.email}</p>
                               <p className="text-[11px] opacity-50 line-clamp-2 leading-relaxed">{msg.message}</p>
                            </div>
                         ))}
                      </div>
                  </div>
                  {/* Right Content */}
                  <div className="flex-1 bg-white dark:bg-[#121212] flex flex-col">
                     {selectedMessage ? (
                        <div className="flex-1 flex flex-col p-10 overflow-y-auto custom-scrollbar">
                           <div className="border-b border-black/5 pb-6 mb-8">
                               <h2 className="text-3xl font-bold mb-6">{selectedMessage.name}</h2>
                               <div className="space-y-1.5 text-xs">
                                  <div className="flex gap-4"><span className="opacity-30 w-12 font-black uppercase text-[9px]">From:</span> <span className="font-bold text-blue-600">{selectedMessage.email}</span></div>
                                  <div className="flex gap-4"><span className="opacity-30 w-12 font-black uppercase text-[9px]">To:</span> <span className="opacity-30">Admin &lt;hello@bbhatt.com.np&gt;</span></div>
                                  <div className="flex gap-4"><span className="opacity-30 w-12 font-black uppercase text-[9px]">Subject:</span> <span className="font-bold">Contact Inquiry</span></div>
                               </div>
                           </div>
                           <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {selectedMessage.message}
                           </div>
                        </div>
                     ) : (
                        <div className="flex-1 flex items-center justify-center opacity-10"><i className="fas fa-envelope-open text-9xl"></i></div>
                     )}
                  </div>
               </div>
            </WindowFrame>
          )}

          {/* WINDOW: PROJECTS (The Manager) */}
          {activeWindow === 'projects' && (
            <WindowFrame title="Deployments — Storage" onClose={() => setActiveWindow(null)} className="absolute inset-4 md:inset-10 lg:inset-20 z-10">
                <div className="bg-white/50 dark:bg-black/20 p-4 border-b border-black/5 flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-black opacity-30 tracking-widest uppercase">Project Archive</h3>
                    <button onClick={() => setIsComposeOpen(true)} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-md"><i className="fas fa-plus mr-2"></i> New Project</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(proj => (
                       <div key={proj.id} onClick={() => handleEditProject(proj)} className="group glass p-4 rounded-2xl border border-black/5 cursor-pointer hover:scale-[1.02] transition-all">
                          <img src={proj.image} className="w-full aspect-video rounded-xl object-cover mb-4 border border-black/5" />
                          <h4 className="font-bold text-sm truncate">{proj.title}</h4>
                          <p className="text-[10px] opacity-40 truncate mb-4">{proj.stack}</p>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 font-black">EDIT</span>
                             <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({isOpen: true, projectId: proj.id}); }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-trash-alt"></i></button>
                          </div>
                       </div>
                    ))}
                </div>
            </WindowFrame>
          )}

          {/* WINDOW: COMPOSE (The Project Form) */}
          {isComposeOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-scale-in">
               <WindowFrame title="New Deployment — Compose" onClose={closeCompose} className="w-full max-w-3xl h-[85vh]">
                  <div className="p-8 border-b border-black/5">
                      <div className="space-y-3">
                          <div className="flex items-center gap-4 border-b border-black/5 pb-2">
                             <span className="text-[10px] font-black opacity-30 uppercase w-16">To:</span>
                             <div className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">Public Portfolio Section</div>
                          </div>
                          <div className="flex items-center gap-4 border-b border-black/5 pb-2">
                             <span className="text-[10px] font-black opacity-30 uppercase w-16">Subject:</span>
                             <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-sm font-bold outline-none" placeholder="Enter Project Name..." />
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                      {/* TECH STACK SYSTEM */}
                      <section className="p-6 rounded-2xl bg-black/5 border border-black/5">
                         <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fas fa-microchip text-blue-500"></i> Tech Arsenal (Stack)</h4>
                         <div className="flex flex-wrap gap-2 mb-4">
                            {techStackList.map(t => (
                               <div key={t} className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center gap-2">
                                  {t} <button onClick={() => setTechStackList(techStackList.filter(item => item !== t))}><i className="fas fa-times opacity-50"></i></button>
                               </div>
                            ))}
                         </div>
                         <div className="flex gap-2">
                            <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTech()} className="flex-1 bg-white/50 p-3 rounded-xl border border-black/5 text-xs outline-none" placeholder="Add Technology (Enter)..." />
                            <button onClick={addTech} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase">Add</button>
                         </div>
                      </section>

                      {/* HIGHLIGHTS SYSTEM */}
                      <section className="p-6 rounded-2xl bg-black/5 border border-black/5">
                         <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fas fa-star text-yellow-500"></i> Key Highlights</h4>
                         <div className="space-y-2 mb-4">
                            {highlightsList.map((h, i) => (
                               <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-black/5 text-xs">
                                  <span className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> {h}</span>
                                  <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-500"><i className="fas fa-trash-alt"></i></button>
                               </div>
                            ))}
                         </div>
                         <div className="flex gap-2">
                            <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHighlight()} className="flex-1 bg-white/50 p-3 rounded-xl border border-black/5 text-xs outline-none" placeholder="Add Achievement / Feature (Enter)..." />
                            <button onClick={addHighlight} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase">Push</button>
                         </div>
                      </section>

                      {/* BASIC ASSETS */}
                      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase opacity-30">Thumbnail Image URL</label>
                             <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-3 rounded-xl bg-black/5 border border-black/5 text-xs outline-none" placeholder="https://..." />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase opacity-30">Deployment URL</label>
                                <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-3 rounded-xl bg-black/5 border border-black/5 text-xs outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase opacity-30">Source Repo URL</label>
                                <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-3 rounded-xl bg-black/5 border border-black/5 text-xs outline-none" />
                            </div>
                         </div>
                      </section>

                      {/* DESCRIPTION */}
                      <section className="space-y-6">
                         <label className="text-[9px] font-black uppercase opacity-30">Project Narrative</label>
                         <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-black/5 border border-black/5 text-sm leading-relaxed outline-none" placeholder="Describe the mission and impact..." />
                         <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-red-500 uppercase">Challenge</label>
                               <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full h-24 p-2 rounded-xl bg-black/5 text-[10px] outline-none" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-green-500 uppercase">Solution</label>
                               <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full h-24 p-2 rounded-xl bg-black/5 text-[10px] outline-none" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-purple-500 uppercase">Results</label>
                               <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full h-24 p-2 rounded-xl bg-black/5 text-[10px] outline-none" />
                            </div>
                         </div>
                      </section>
                  </div>

                  <div className="p-6 border-t border-black/5 flex justify-end gap-3 bg-white/40">
                      <button onClick={closeCompose} className="px-6 py-2.5 rounded-xl hover:bg-black/5 font-bold text-xs uppercase">Discard</button>
                      <button onClick={handleSaveProject} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xl uppercase"><i className="fas fa-paper-plane mr-2"></i> Deploy Project</button>
                  </div>
               </WindowFrame>
            </div>
          )}

      </main>

      {/* 3. DESKTOP DOCK (The macOS Launcher) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 glass-strong rounded-3xl shadow-2xl border border-white/40 z-50">
          <button onClick={() => setActiveWindow('inbox')} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${activeWindow === 'inbox' ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-black/5 hover:scale-110'}`}>
              <i className="fas fa-envelope"></i>
          </button>
          <button onClick={() => setActiveWindow('projects')} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${activeWindow === 'projects' ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-black/5 hover:scale-110'}`}>
              <i className="fas fa-layer-group"></i>
          </button>
          <div className="w-px h-8 bg-black/10 mx-2"></div>
          <button onClick={() => setIsComposeOpen(true)} className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center text-xl hover:scale-110 transition-transform">
              <i className="fas fa-plus"></i>
          </button>
      </div>

      {/* DELETE CONFIRM */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
           <div className="glass-strong p-10 rounded-[2.5rem] w-full max-w-sm text-center border border-white/20 shadow-2xl animate-scale-in">
              <i className="fas fa-trash-alt text-4xl text-red-500 mb-6"></i>
              <h3 className="text-xl font-bold mb-2">Delete Project?</h3>
              <p className="text-sm opacity-50 mb-8">This will permanently remove the project from the public workspace.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm({isOpen: false, projectId: null})} className="flex-1 p-4 bg-black/5 rounded-xl font-bold text-sm">Cancel</button>
                <button onClick={async () => {
                   if (deleteConfirm.projectId) {
                      await deleteDoc(doc(db, "projects", deleteConfirm.projectId));
                      fetchProjects();
                      setDeleteConfirm({isOpen: false, projectId: null});
                   }
                }} className="flex-1 p-4 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg">Confirm</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;