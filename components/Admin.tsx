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
    } catch (err) { alert("Error saving project."); }
  };

  if (loading) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-10 rounded-xl w-full max-w-sm shadow-xl border border-slate-200 text-center animate-scale-in">
        <div className="w-12 h-12 bg-[#001529] rounded-lg mx-auto flex items-center justify-center shadow-md mb-6 text-white font-bold text-xl">BR</div>
        <h2 className="text-xl font-bold mb-8 text-slate-800 tracking-tight">Admin Authentication</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded border border-slate-300 outline-none text-sm focus:ring-1 focus:ring-blue-500" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded border border-slate-300 outline-none text-sm focus:ring-1 focus:ring-blue-500" />
          <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded shadow hover:bg-blue-700 transition-all text-sm uppercase">Login</button>
        </form>
        {error && <p className="text-red-500 text-[11px] mt-4 font-bold uppercase">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active }: { icon: string, label: string, view: AdminView, active: boolean }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${active ? 'bg-blue-600 text-white shadow-lg z-10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <i className={`fas ${icon} w-5`}></i>
      <span className="hidden md:block font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-slate-100 text-slate-900 font-sans">
      
      {/* SIDEBAR - Professional Dark Navy */}
      <aside className="w-20 md:w-64 bg-[#001529] flex flex-col shrink-0">
          <div className="p-6 pb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">BR</div>
              <span className="hidden md:block font-bold text-white tracking-tight">Bhupesh Console</span>
          </div>
          <nav className="flex-1">
              <SidebarItem icon="fa-chart-pie" label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-list-ul" label="Projects List" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Inquiries" view="messages-list" active={currentView === 'messages-list'} />
          </nav>
          <div className="p-4 border-t border-white/10">
              <button onClick={() => signOut(auth)} className="w-full py-3 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest text-left px-4">
                  <i className="fas fa-sign-out-alt mr-3"></i> <span className="hidden md:inline">Sign Out</span>
              </button>
          </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* HEADER - Clean White */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-20">
              <div className="flex items-center gap-4">
                <i className="fas fa-bars text-slate-400 cursor-pointer md:hidden"></i>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {currentView === 'dashboard' && 'Control Center'}
                  {currentView === 'projects-list' && 'Project Management'}
                  {currentView === 'messages-list' && 'Communications'}
                  {currentView === 'project-editor' && 'Editor'}
                  {currentView === 'message-viewer' && 'Inquiry Detail'}
                </h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative text-slate-400 hover:text-blue-500 cursor-pointer">
                    <i className="fas fa-bell"></i>
                    {messages.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white">{messages.length}</span>}
                </div>
                <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                    <span className="text-xs font-bold text-slate-600 hidden sm:block">Admin Account</span>
                    <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" className="w-8 h-8 rounded-full border border-slate-200" />
                </div>
              </div>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Projects</h4>
                                <p className="text-3xl font-bold">{projects.length}</p>
                              </div>
                              <p className="text-xs text-green-500 mt-4"><i className="fas fa-arrow-up mr-1"></i> Active Deployment</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unread Messages</h4>
                                <p className="text-3xl font-bold">{messages.length}</p>
                              </div>
                              <p className="text-xs text-blue-500 mt-4"><i className="fas fa-clock mr-1"></i> Response Pending</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 lg:col-span-2">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Project Efficiency</h4>
                             <div className="flex items-center gap-6">
                                <span className="text-5xl font-bold text-blue-600">94%</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="w-[94%] h-full bg-blue-600"></div>
                                </div>
                             </div>
                             <p className="text-xs text-slate-400 mt-4">System optimization metrics healthy.</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Recent Projects</h3>
                                <button onClick={() => setCurrentView('projects-list')} className="text-xs text-blue-600 font-bold hover:underline">View All</button>
                             </div>
                             <div className="divide-y divide-slate-50">
                                {projects.slice(0, 5).map(p => (
                                    <div key={p.id} className="p-4 flex items-center gap-4">
                                        <img src={p.image} className="w-12 h-10 object-cover rounded border border-slate-200" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">{p.title}</p>
                                            <p className="text-[10px] text-slate-400 uppercase">{p.stack.slice(0, 30)}...</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                          </div>
                          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Recent Inquiries</h3>
                                <button onClick={() => setCurrentView('messages-list')} className="text-xs text-blue-600 font-bold hover:underline">View All</button>
                             </div>
                             <div className="divide-y divide-slate-50">
                                {messages.slice(0, 5).map(m => (
                                    <div key={m.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{m.name[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{m.name}</p>
                                                <p className="text-[10px] text-slate-400 truncate w-32 md:w-48">{m.message}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-300">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                    </div>
                                ))}
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECTS LIST */}
              {currentView === 'projects-list' && (
                  <div className="animate-fade-up">
                      <div className="flex justify-between items-center mb-8">
                          <h1 className="text-2xl font-bold">Portfolio Records</h1>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-sm shadow hover:bg-blue-700">Add New Project</button>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                      <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                                      <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stack</th>
                                      <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {projects.map(p => (
                                      <tr key={p.id} className="hover:bg-slate-50 group">
                                          <td className="p-5">
                                              <div className="flex items-center gap-4">
                                                  <img src={p.image} className="w-16 h-10 object-cover rounded shadow-sm" />
                                                  <span className="font-bold text-slate-800">{p.title}</span>
                                              </div>
                                          </td>
                                          <td className="p-5">
                                              <span className="text-xs font-medium text-slate-500">{p.stack}</span>
                                          </td>
                                          <td className="p-5 text-center">
                                              <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button onClick={() => navigateToEditor(p)} className="text-blue-500 hover:text-blue-700"><i className="fas fa-edit"></i></button>
                                                  <button onClick={async () => { if(confirm('Delete?')) { await deleteDoc(doc(db, "projects", p.id)); fetchProjects(); } }} className="text-red-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {projects.length === 0 && <div className="p-20 text-center text-slate-300">No project logs found.</div>}
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up">
                      <h1 className="text-2xl font-bold mb-8">Client Signals</h1>
                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                          <div className="divide-y divide-slate-100">
                              {messages.map(m => (
                                  <div key={m.id} onClick={() => { setSelectedMessage(m); setCurrentView('message-viewer'); }} className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer group">
                                      <div className="flex items-center gap-6">
                                          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xl">{m.name[0]}</div>
                                          <div>
                                              <h4 className="font-bold text-slate-800">{m.name}</h4>
                                              <p className="text-xs text-blue-600 font-semibold">{m.email}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] font-bold text-slate-300 mb-2 uppercase">{m.timestamp?.toDate().toLocaleString()}</p>
                                          <i className="fas fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-all"></i>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {messages.length === 0 && <div className="p-20 text-center text-slate-300">Inbox is empty.</div>}
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECT EDITOR (FULL PAGE FORM) */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-4xl mx-auto pb-20">
                      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200">
                          <div>
                              <button onClick={() => setCurrentView('projects-list')} className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block hover:underline">
                                  <i className="fas fa-arrow-left mr-2"></i> Back to List
                              </button>
                              <h1 className="text-3xl font-bold text-slate-800">{editingProject ? 'Edit Project Spec' : 'New Project Deployment'}</h1>
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => setCurrentView('projects-list')} className="px-6 py-2.5 rounded border border-slate-300 text-slate-500 text-sm font-bold bg-white hover:bg-slate-50">Cancel</button>
                              <button onClick={handleSaveProject} className="px-8 py-2.5 bg-blue-600 text-white rounded text-sm font-bold shadow-md hover:bg-blue-700">Save Project</button>
                          </div>
                      </div>

                      <div className="space-y-12">
                          <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3 mb-6">General Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-2">
                                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Project Title</label>
                                      <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium" placeholder="Ex: E-commerce Platform" />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Hero Image URL</label>
                                      <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium" placeholder="https://..." />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Live URL</label>
                                      <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium" placeholder="https://..." />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Source Repo URL</label>
                                      <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium" placeholder="https://github.com/..." />
                                  </div>
                              </div>
                              <div className="space-y-2 pt-4">
                                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Quick Description</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium h-24" placeholder="Brief summary of the project..." />
                              </div>
                          </section>

                          <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-8">
                               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Technical Breakdown</h3>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                   <div className="space-y-4">
                                       <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Technology Stack (Enter to add)</label>
                                       <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="w-full p-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="React, Node.js, etc." />
                                       <div className="flex flex-wrap gap-2 mt-2">
                                           {techStackList.map(t => (
                                               <span key={t} className="px-3 py-1 bg-slate-100 text-[10px] font-bold uppercase text-slate-600 rounded flex items-center gap-2">
                                                   {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-red-400">×</button>
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                                   <div className="space-y-4">
                                       <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Performance Highlights (Enter to add)</label>
                                       <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setHighlightsList([...highlightsList, highlightInput]), setHighlightInput(''))} className="w-full p-3 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="99% Lighthouse score, etc." />
                                       <div className="space-y-1 mt-2">
                                           {highlightsList.map((h, i) => (
                                               <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 flex justify-between items-center">
                                                   {h} <button onClick={() => setHighlightsList(highlightsList.filter((_, idx) => idx !== i))} className="text-red-300 hover:text-red-500">×</button>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                          </section>

                          <section className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-10">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Architecture Narrative</h3>
                              
                              <div className="space-y-8">
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-red-500 uppercase tracking-widest">The Problem (Challenge)</label>
                                      <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-red-500 transition-all text-sm leading-relaxed h-40" placeholder="What specific problem were you trying to solve?" />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-green-600 uppercase tracking-widest">The Solution (Implementation)</label>
                                      <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-green-500 transition-all text-sm leading-relaxed h-40" placeholder="How did you architect the resolution?" />
                                  </div>
                                  <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">The Results (Metrics/Impact)</label>
                                      <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-blue-500 transition-all text-sm leading-relaxed h-40" placeholder="What were the outcomes of this deployment?" />
                                  </div>
                              </div>
                          </section>
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGE VIEWER (FULL PAGE) */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up max-w-4xl mx-auto">
                      <button onClick={() => setCurrentView('messages-list')} className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-10 flex items-center gap-2 hover:underline">
                          <i className="fas fa-arrow-left"></i> Back to Inbox
                      </button>
                      
                      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                          <header className="p-10 border-b border-slate-100 bg-slate-50/50">
                              <h2 className="text-4xl font-bold text-slate-800 mb-6">{selectedMessage.name}</h2>
                              <div className="flex flex-wrap gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                  <div className="flex items-center gap-2"><i className="fas fa-envelope text-blue-500"></i> {selectedMessage.email}</div>
                                  <div className="flex items-center gap-2"><i className="fas fa-calendar-alt text-blue-500"></i> {selectedMessage.timestamp?.toDate().toLocaleString()}</div>
                              </div>
                          </header>
                          <div className="p-10 md:p-14 text-xl leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                              {selectedMessage.message}
                          </div>
                          <footer className="p-10 border-t border-slate-100 flex gap-4">
                              <a href={`mailto:${selectedMessage.email}`} className="flex-1 py-4 bg-blue-600 text-white rounded text-sm font-bold shadow hover:bg-blue-700 text-center">Reply via Email</a>
                              <button onClick={async () => { if(confirm('Delete message?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setCurrentView('messages-list'); } }} className="px-8 py-4 bg-red-50 text-red-500 border border-red-100 rounded text-sm font-bold hover:bg-red-100">Delete Permanently</button>
                          </footer>
                      </div>
                  </div>
              )}

          </div>
      </main>

    </div>
  );
};

export default Admin;