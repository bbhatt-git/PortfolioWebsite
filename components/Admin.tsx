import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Project } from '../types';

type AdminView = 'dashboard' | 'projects-list' | 'messages-list' | 'project-editor' | 'message-viewer';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  
  // Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Selection State
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<{ show: boolean; type: 'project' | 'message'; id: string; title: string } | null>(null);

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
    } catch (err) { setError('System Access Denied: Unauthorized Credentials'); }
  };

  const navigateToEditor = (proj?: Project) => {
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

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Title and Tech Stack are required.");
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
      setCurrentView('projects-list');
    } catch (err) { alert("Error saving project deployment."); }
  };

  const confirmDelete = async () => {
    if (!deleteConfig) return;
    try {
      if (deleteConfig.type === 'project') {
        await deleteDoc(doc(db, "projects", deleteConfig.id));
        fetchProjects();
      } else {
        await deleteDoc(doc(db, "messages", deleteConfig.id));
        fetchMessages();
        if (currentView === 'message-viewer') setCurrentView('messages-list');
      }
      setDeleteConfig(null);
    } catch (e) {
      alert("Purge operation failed.");
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#F0F2F5] dark:bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6 relative overflow-hidden">
      {/* Background Blobs for designed look */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[120px] animate-blob-reverse"></div>
      
      <div className="glass-strong p-10 md:p-14 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/40 dark:border-white/10 text-center animate-scale-in relative z-10 backdrop-blur-3xl">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-8 transform transition-transform hover:rotate-12">
            <span className="font-mono font-black text-white text-2xl tracking-tighter">BR</span>
        </div>
        <h2 className="text-3xl font-black mb-2 text-slate-800 dark:text-white tracking-tighter">Command Control</h2>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10">Authorized Personnel Only</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
            <input type="email" placeholder="Identity" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/50 outline-none text-sm font-bold transition-all" />
          </div>
          <div className="relative group">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
            <input type="password" placeholder="Key Phrase" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/50 outline-none text-sm font-bold transition-all" />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs">Establish Link</button>
        </form>
        {error && <p className="text-red-500 text-[10px] mt-6 font-black uppercase tracking-[0.2em]">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active }: { icon: string, label: string, view: AdminView, active: boolean }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all relative group ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {active && <div className="absolute inset-y-2 left-2 right-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 z-0"></div>}
      <i className={`fas ${icon} text-sm w-5 z-10 transition-transform group-hover:scale-110`}></i>
      <span className="hidden md:block text-[13px] font-bold tracking-tight z-10">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#080808] text-slate-900 dark:text-white font-sans overflow-hidden">
      
      {/* SIDEBAR - Ultra Glass */}
      <aside className="w-16 md:w-64 bg-white/50 dark:bg-black/50 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 z-50">
          <div className="p-6 pb-10 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/10">BR</div>
              <div className="hidden md:block">
                  <h1 className="font-black text-sm leading-none">BHUPESH</h1>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Admin Panel</p>
              </div>
          </div>
          <nav className="flex-1 mt-4 px-2 space-y-1">
              <SidebarItem icon="fa-th-large" label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-layer-group" label="Projects Repository" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Inquiry Logs" view="messages-list" active={currentView === 'messages-list'} />
          </nav>
          <div className="p-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => signOut(auth)} className="w-full py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                  <i className="fas fa-power-off"></i> <span className="hidden md:inline">Disconnect</span>
              </button>
          </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* HEADER */}
          <header className="h-16 bg-white/70 dark:bg-black/40 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0 z-40">
              <div className="flex items-center gap-4">
                <i className="fas fa-chevron-left text-slate-300 md:hidden"></i>
                <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
                  {currentView.replace('-', ' ')}
                </h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative text-slate-400 hover:text-blue-500 cursor-pointer transition-colors">
                    <i className="fas fa-bell"></i>
                    {messages.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white dark:border-black font-black">{messages.length}</span>}
                </div>
                <div className="flex items-center gap-3 border-l border-slate-100 dark:border-white/5 pl-6 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none mb-1">SYSTEM ROOT</p>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest leading-none">Online</p>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff&bold=true" className="w-8 h-8 rounded-xl shadow-lg" />
                </div>
              </div>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F2F2F7] dark:bg-[#080808] custom-scrollbar relative z-10">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up max-w-7xl mx-auto">
                      <header className="mb-10">
                          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">Operations Summary</h2>
                          <p className="text-sm font-medium text-slate-400">Holistic view of your digital ecosystem.</p>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                          <div className="glass-strong p-6 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-xl hover:scale-[1.02] transition-transform">
                             <div className="flex justify-between items-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-xl"><i className="fas fa-cubes"></i></div>
                                <i className="fas fa-ellipsis-h text-slate-200"></i>
                             </div>
                             <p className="text-3xl font-black mb-1">{projects.length}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Deployments</p>
                          </div>
                          
                          <div className="glass-strong p-6 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-xl hover:scale-[1.02] transition-transform">
                             <div className="flex justify-between items-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-xl"><i className="fas fa-paper-plane"></i></div>
                                <i className="fas fa-ellipsis-h text-slate-200"></i>
                             </div>
                             <p className="text-3xl font-black mb-1">{messages.length}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound Signals</p>
                          </div>

                          <div className="glass-strong p-6 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-xl lg:col-span-2 relative overflow-hidden group">
                             <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Network Integrity</p>
                                <div className="flex items-end justify-between">
                                    <div className="flex-1 mr-10">
                                    <div className="flex justify-between items-center text-[11px] font-black text-slate-800 dark:text-white mb-3">
                                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> LOAD EFFICIENCY</span>
                                        <span className="text-blue-500">100%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                                    </div>
                                    </div>
                                    <div className="text-right">
                                    <p className="text-4xl font-black text-slate-900 dark:text-white">OPTIMAL</p>
                                    </div>
                                </div>
                             </div>
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* RECENT PROJECTS */}
                          <div className="glass-strong rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col">
                             <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/20 dark:bg-white/5">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Recent Deployments</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">Full Log</button>
                             </div>
                             <div className="flex-1">
                                <div className="divide-y divide-slate-50 dark:divide-white/5">
                                    {projects.slice(0, 5).map(p => (
                                        <div key={p.id} className="p-6 flex items-center gap-5 hover:bg-white/40 dark:hover:bg-white/5 transition-all cursor-pointer group" onClick={() => navigateToEditor(p)}>
                                            <div className="relative shrink-0">
                                                <img src={p.image} className="w-16 h-12 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform" />
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white dark:border-black"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-slate-800 dark:text-white truncate mb-0.5">{p.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{p.stack}</p>
                                            </div>
                                            <i className="fas fa-chevron-right text-[10px] text-slate-200"></i>
                                        </div>
                                    ))}
                                </div>
                                {projects.length === 0 && <div className="p-20 text-center text-slate-300 dark:text-slate-600 text-xs uppercase tracking-[0.5em]">No Data</div>}
                             </div>
                          </div>

                          {/* RECENT INQUIRIES */}
                          <div className="glass-strong rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col">
                             <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/20 dark:bg-white/5">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Recent Signals</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">Inbox</button>
                             </div>
                             <div className="flex-1">
                                <div className="divide-y divide-slate-50 dark:divide-white/5">
                                    {messages.slice(0, 5).map((m) => (
                                        <div key={m.id} className="p-6 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-all cursor-pointer" onClick={() => { setSelectedMessage(m); setCurrentView('message-viewer'); }}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-200 flex items-center justify-center font-black text-xs border border-white/50 dark:border-white/10">{m.name[0]}</div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-800 dark:text-white truncate w-32 md:w-48">{m.name}</p>
                                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest truncate">{m.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 whitespace-nowrap bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-md uppercase">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                                {messages.length === 0 && <div className="p-20 text-center text-slate-300 dark:text-slate-600 text-xs uppercase tracking-[0.5em]">Clear Frequency</div>}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECTS LIST */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up max-w-6xl mx-auto">
                      <div className="flex justify-between items-end mb-10">
                          <div>
                            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Deployments</h2>
                            <p className="text-sm text-slate-400 font-medium">Manage your signature projects.</p>
                          </div>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">Add Record</button>
                      </div>
                      <div className="glass-strong rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-white/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                  <tr>
                                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Project Identity</th>
                                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Technical Stack</th>
                                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Protocol</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                  {projects.map(p => (
                                      <tr key={p.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-all group">
                                          <td className="p-6">
                                              <div className="flex items-center gap-5">
                                                  <img src={p.image} className="w-16 h-12 object-cover rounded-xl shadow-md group-hover:rotate-2 transition-transform" />
                                                  <span className="font-black text-slate-800 dark:text-white text-base">{p.title}</span>
                                              </div>
                                          </td>
                                          <td className="p-6">
                                              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight leading-relaxed">{p.stack}</span>
                                          </td>
                                          <td className="p-6 text-center">
                                              <div className="flex justify-center gap-4 text-slate-300">
                                                  <button onClick={() => navigateToEditor(p)} className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-edit text-xs"></i></button>
                                                  <button onClick={() => setDeleteConfig({ show: true, type: 'project', id: p.id, title: p.title })} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"><i className="fas fa-trash-alt text-xs"></i></button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up max-w-5xl mx-auto">
                      <header className="mb-10">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Communication Logs</h2>
                        <p className="text-sm text-slate-400 font-medium">Signals received via landing page.</p>
                      </header>
                      <div className="glass-strong rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl overflow-hidden">
                          <div className="divide-y divide-slate-100 dark:divide-white/5">
                              {messages.map(m => (
                                  <div key={m.id} onClick={() => { setSelectedMessage(m); setCurrentView('message-viewer'); }} className="p-8 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer group transition-all">
                                      <div className="flex items-center gap-6">
                                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-100 flex items-center justify-center font-black text-xl border border-white/50 dark:border-white/10 transition-all group-hover:scale-105">{m.name[0]}</div>
                                          <div>
                                              <h4 className="font-black text-slate-800 dark:text-white text-lg leading-none mb-1 group-hover:text-blue-500 transition-colors">{m.name}</h4>
                                              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em]">{m.email}</p>
                                          </div>
                                      </div>
                                      <div className="text-right flex items-center gap-10">
                                          <div className="hidden sm:block">
                                              <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase mb-1">Received At</p>
                                              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{m.timestamp?.toDate().toLocaleString()}</p>
                                          </div>
                                          <i className="fas fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-all"></i>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECT EDITOR */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-4xl mx-auto pb-20">
                      <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-200 dark:border-white/5">
                          <div>
                              <button onClick={() => setCurrentView('projects-list')} className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2 hover:gap-4 transition-all">
                                  <i className="fas fa-arrow-left"></i> Return to Registry
                              </button>
                              <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{editingProject ? 'Update Specification' : 'New Deployment'}</h1>
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('projects-list')} className="px-8 py-3 rounded-2xl border border-slate-300 dark:border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/50 transition-all">Cancel</button>
                              <button onClick={handleSaveProject} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all">Establish Protocol</button>
                          </div>
                      </div>

                      <div className="space-y-10">
                          {/* Metadata Card */}
                          <section className="glass-strong p-10 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl space-y-8">
                              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 pb-4 border-b border-black/5 dark:border-white/5">System Identity</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Project Name</label>
                                      <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="Subject Name..." />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Visual Asset URL</label>
                                      <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="https://cdn..." />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Live Terminal</label>
                                      <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="https://..." />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Central Repository</label>
                                      <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-4 bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm" placeholder="https://github.com/..." />
                                  </div>
                              </div>
                              <div className="space-y-3 pt-4">
                                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Narrative Overview</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-6 bg-slate-100 dark:bg-white/5 border border-transparent rounded-[2rem] text-sm font-bold leading-relaxed outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-4 ring-blue-500/5 h-32 transition-all" placeholder="Project deployment brief..." />
                              </div>
                          </section>

                          {/* Tech Pillar Card */}
                          <section className="glass-strong p-10 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl">
                               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 pb-4 border-b border-black/5 dark:border-white/5">Technical Arsenal</h3>
                               <div className="space-y-4">
                                   <div className="space-y-3">
                                       <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Integrated Technologies (ENTER to commit)</label>
                                       <div className="flex gap-3">
                                          <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-4 bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-white/10 font-bold text-sm" placeholder="Ex: React, Node.js..." />
                                          <button onClick={() => { setTechStackList([...techStackList, techInput]); setTechInput(''); }} className="px-6 bg-blue-600 text-white rounded-2xl font-black text-lg">+</button>
                                       </div>
                                       <div className="flex flex-wrap gap-2 mt-4">
                                           {techStackList.map(t => (
                                               <span key={t} className="px-4 py-2 bg-blue-600/10 text-blue-600 border border-blue-600/20 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3">
                                                   {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-500 hover:scale-150 transition-transform">×</button>
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                          </section>

                          {/* Deployment Deep Dive */}
                          <section className="glass-strong p-10 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl space-y-10">
                              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 pb-4 border-b border-black/5 dark:border-white/5">Architectural Narrative</h3>
                              <div className="grid grid-cols-1 gap-10">
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">The Impediment (Challenge)</label>
                                      <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full p-6 bg-red-500/5 border border-transparent rounded-[2rem] text-sm font-bold leading-relaxed h-32 outline-none focus:bg-white dark:focus:bg-red-500/10 focus:ring-4 ring-red-500/5 transition-all" />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">The Resolution (Solution)</label>
                                      <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full p-6 bg-green-500/5 border border-transparent rounded-[2rem] text-sm font-bold leading-relaxed h-32 outline-none focus:bg-white dark:focus:bg-green-500/10 focus:ring-4 ring-green-500/5 transition-all" />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">The Impact (Results)</label>
                                      <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full p-6 bg-blue-500/5 border border-transparent rounded-[2rem] text-sm font-bold leading-relaxed h-32 outline-none focus:bg-white dark:focus:bg-blue-500/10 focus:ring-4 ring-blue-500/5 transition-all" />
                                  </div>
                              </div>
                          </section>
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGE VIEWER (MAC-STYLE) */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-10">
                      <div className="w-full max-w-2xl glass-strong text-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-white/5 flex flex-col relative animate-scale-in">
                          
                          {/* macOS Title Bar */}
                          <div className="bg-white/20 dark:bg-white/5 h-14 flex items-center px-6 justify-between border-b border-white/5 relative shrink-0">
                             <div className="flex gap-2">
                               <div onClick={() => setCurrentView('messages-list')} className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm cursor-pointer hover:opacity-80 transition-opacity"></div>
                               <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
                               <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
                             </div>
                             <div className="flex items-center gap-3 opacity-60">
                                <i className="fas fa-satellite-dish text-[10px] text-blue-400"></i>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Signal Protocol</span>
                             </div>
                             <div className="w-12 flex justify-end opacity-50">
                               <i onClick={() => setCurrentView('messages-list')} className="fas fa-reply text-[10px] text-slate-800 dark:text-white cursor-pointer hover:opacity-100"></i>
                             </div>
                          </div>

                          {/* Headers */}
                          <div className="text-sm">
                             <div className="flex items-center border-b border-black/5 dark:border-white/5 px-8 py-5 hover:bg-white/10 transition-colors">
                               <span className="text-slate-400 font-bold w-20 text-[10px] uppercase tracking-widest">Origin:</span>
                               <span className="text-slate-900 dark:text-white font-black text-base">{selectedMessage.name}</span>
                             </div>
                             <div className="flex items-center border-b border-black/5 dark:border-white/5 px-8 py-5 hover:bg-white/10 transition-colors">
                               <span className="text-slate-400 font-bold w-20 text-[10px] uppercase tracking-widest">Frequency:</span>
                               <span className="text-blue-500 font-black text-sm">{selectedMessage.email}</span>
                             </div>
                          </div>

                          {/* Message Body */}
                          <div className="p-10 min-h-[350px] overflow-y-auto custom-scrollbar">
                             <div className="text-slate-800 dark:text-gray-200 leading-[1.8] font-medium text-lg whitespace-pre-wrap">
                               {selectedMessage.message}
                             </div>
                          </div>

                          {/* Toolbar Footer */}
                          <div className="bg-white/20 dark:bg-white/5 backdrop-blur-3xl px-8 py-6 flex justify-between items-center border-t border-black/5 dark:border-white/5 shrink-0">
                             <div></div>
                             <div className="flex gap-4">
                                <button 
                                  onClick={() => setDeleteConfig({ show: true, type: 'message', id: selectedMessage.id, title: `Inquiry from ${selectedMessage.name}` })}
                                  className="px-6 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                  Purge Data
                                </button>
                                <a 
                                  href={`mailto:${selectedMessage.email}`}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest"
                                >
                                  <i className="fas fa-reply"></i> Reply Signal
                                </a>
                             </div>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

      {/* CUSTOM PURGE CONFIRMATION MODAL */}
      {deleteConfig && deleteConfig.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
              <div className={`w-full max-w-md glass-strong rounded-[2.5rem] border overflow-hidden shadow-2xl animate-scale-in text-center p-10 ${deleteConfig.type === 'project' ? 'border-red-500/30' : 'border-white/10'}`}>
                  <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-8 shadow-2xl ${deleteConfig.type === 'project' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-slate-800 text-white shadow-black/20'}`}>
                      <i className={deleteConfig.type === 'project' ? 'fas fa-exclamation-triangle' : 'fas fa-trash-alt'}></i>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Confirm System Purge</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                      Are you sure you want to permanently erase <span className="font-black text-slate-800 dark:text-white">"{deleteConfig.title}"</span>? This operation cannot be reversed.
                  </p>

                  <div className="flex gap-4">
                      <button onClick={() => setDeleteConfig(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Abort Action</button>
                      <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-500 transition-all">Proceed with Purge</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Admin;