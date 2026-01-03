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
    <div className="h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F0F2F5] p-6">
      <div className="bg-white p-8 rounded-lg w-full max-w-sm shadow-md border border-slate-200 text-center animate-scale-in">
        <div className="w-12 h-12 bg-[#001529] rounded-lg mx-auto flex items-center justify-center shadow-sm mb-6 text-white font-bold text-xl">BR</div>
        <h2 className="text-lg font-bold mb-6 text-slate-800 tracking-tight">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 rounded border border-slate-300 outline-none text-sm focus:ring-1 focus:ring-blue-500 bg-slate-50" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 rounded border border-slate-300 outline-none text-sm focus:ring-1 focus:ring-blue-500 bg-slate-50" />
          <button className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded hover:bg-blue-700 transition-all text-sm uppercase tracking-wide">Enter</button>
        </form>
        {error && <p className="text-red-500 text-[11px] mt-4 font-bold">{error}</p>}
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, view, active }: { icon: string, label: string, view: AdminView, active: boolean }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${active ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <i className={`fas ${icon} text-sm w-4`}></i>
      <span className="hidden md:block text-[13px]">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-[#F0F2F5] text-slate-900 font-sans">
      
      {/* SIDEBAR - Dark and Minimal */}
      <aside className="w-16 md:w-56 bg-[#001529] flex flex-col shrink-0">
          <div className="p-5 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">BR</div>
              <span className="hidden md:block font-bold text-white text-sm">Bhupesh Raj</span>
          </div>
          <nav className="flex-1 mt-4">
              <SidebarItem icon="fa-th-large" label="Dashboard" view="dashboard" active={currentView === 'dashboard'} />
              <SidebarItem icon="fa-layer-group" label="Projects" view="projects-list" active={currentView === 'projects-list'} />
              <SidebarItem icon="fa-envelope" label="Inquiries" view="messages-list" active={currentView === 'messages-list'} />
          </nav>
          <div className="p-4">
              <button onClick={() => signOut(auth)} className="w-full py-2 text-slate-400 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest text-left px-4">
                  <i className="fas fa-sign-out-alt mr-2"></i> <span className="hidden md:inline">Log Out</span>
              </button>
          </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* TOP BAR - Clean White */}
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
              <div className="flex items-center gap-3">
                <i className="fas fa-bars text-slate-400 cursor-pointer"></i>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">
                  {currentView === 'dashboard' && 'Dashboard Overview'}
                  {currentView === 'projects-list' && 'Project List'}
                  {currentView === 'messages-list' && 'Inquiry List'}
                  {currentView === 'project-editor' && 'Form Editor'}
                  {currentView === 'message-viewer' && 'Inquiry View'}
                </h2>
              </div>
              <div className="flex items-center gap-5">
                <i className="fas fa-search text-slate-300 text-sm"></i>
                <i className="fas fa-question-circle text-slate-300 text-sm"></i>
                <div className="relative text-slate-400">
                    <i className="fas fa-bell text-sm"></i>
                    {messages.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white font-bold">{messages.length}</span>}
                </div>
                <div className="flex items-center gap-2 ml-2 border-l border-slate-100 pl-4">
                    <img src="https://ui-avatars.com/api/?name=Bhupesh&background=007AFF&color=fff" className="w-7 h-7 rounded-full" />
                    <span className="text-xs font-bold text-slate-600 hidden sm:block">Bhupesh</span>
                </div>
              </div>
          </header>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F0F2F5]">
              
              {/* VIEW: DASHBOARD */}
              {currentView === 'dashboard' && (
                  <div className="animate-fade-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
                             <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projects</p>
                                  <p className="text-2xl font-bold">{projects.length}</p>
                                </div>
                                <i className="fas fa-info-circle text-slate-200 text-xs"></i>
                             </div>
                             <p className="text-[11px] text-slate-400 mt-4">Total deployments active.</p>
                          </div>
                          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
                             <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inquiries</p>
                                  <p className="text-2xl font-bold">{messages.length}</p>
                                </div>
                                <i className="fas fa-info-circle text-slate-200 text-xs"></i>
                             </div>
                             <p className="text-[11px] text-slate-400 mt-4">Unread signals from inbox.</p>
                          </div>
                          <div className="bg-white p-5 rounded border border-slate-200 shadow-sm lg:col-span-2">
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Operations Status</p>
                             <div className="flex items-end justify-between">
                                <div className="flex-1 mr-6">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-2">
                                     <span>LOAD BALANCE</span>
                                     <span>98%</span>
                                  </div>
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="w-[98%] h-full bg-blue-500"></div>
                                  </div>
                                </div>
                                <div className="text-center">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Effect</p>
                                   <p className="text-2xl font-bold">100%</p>
                                </div>
                             </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-8 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="text-[13px] font-bold text-slate-600">Recent Signals Trend</h3>
                                <div className="flex gap-4 text-[11px] text-slate-400 font-medium">
                                   <span className="text-blue-500 font-bold border-b-2 border-blue-500 pb-1">All Year</span>
                                   <span>2024</span>
                                </div>
                             </div>
                             <div className="p-10 h-64 flex items-end justify-between gap-4">
                                {[35, 25, 18, 12, 10, 22, 55, 38, 30, 42].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-100 rounded-t hover:bg-blue-500 transition-colors cursor-pointer relative group" style={{ height: `${h}%` }}>
                                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[9px] font-bold text-blue-500">{h}</div>
                                    </div>
                                ))}
                             </div>
                          </div>
                          <div className="lg:col-span-4 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                             <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-[13px] font-bold text-slate-600">Activity Ranking</h3>
                             </div>
                             <div className="p-4 space-y-4">
                                {messages.slice(0, 6).map((m, i) => (
                                    <div key={m.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${i < 3 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                                            <span className="text-xs font-medium text-slate-600 truncate w-32">{m.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-slate-400">LOG-0{i+1}</span>
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
                      <div className="flex justify-between items-center mb-6">
                          <h1 className="text-lg font-bold text-slate-800">Project Repository</h1>
                          <button onClick={() => navigateToEditor()} className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold shadow-sm hover:bg-blue-700">New Deployment</button>
                      </div>
                      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifier</th>
                                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stack</th>
                                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {projects.map(p => (
                                      <tr key={p.id} className="hover:bg-slate-50 group">
                                          <td className="p-4">
                                              <div className="flex items-center gap-3">
                                                  <img src={p.image} className="w-10 h-7 object-cover rounded shadow-sm border border-slate-100" />
                                                  <span className="font-bold text-slate-700 text-xs">{p.title}</span>
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className="text-[11px] font-medium text-slate-500">{p.stack}</span>
                                          </td>
                                          <td className="p-4 text-center">
                                              <div className="flex justify-center gap-4 text-slate-300">
                                                  <button onClick={() => navigateToEditor(p)} className="hover:text-blue-500"><i className="fas fa-edit text-xs"></i></button>
                                                  <button onClick={async () => { if(confirm('Purge?')) { await deleteDoc(doc(db, "projects", p.id)); fetchProjects(); } }} className="hover:text-red-500"><i className="fas fa-trash-alt text-xs"></i></button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {projects.length === 0 && <div className="p-12 text-center text-slate-300 text-xs uppercase tracking-widest">Empty Repo</div>}
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGES LIST */}
              {currentView === 'messages-list' && (
                  <div className="animate-fade-up">
                      <h1 className="text-lg font-bold text-slate-800 mb-6">Inbound Signals</h1>
                      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                          <div className="divide-y divide-slate-100">
                              {messages.map(m => (
                                  <div key={m.id} onClick={() => { setSelectedMessage(m); setCurrentView('message-viewer'); }} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer group">
                                      <div className="flex items-center gap-4">
                                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">{m.name[0]}</div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 text-[13px]">{m.name}</h4>
                                              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">{m.email}</p>
                                          </div>
                                      </div>
                                      <div className="text-right flex items-center gap-8">
                                          <span className="text-[9px] font-bold text-slate-300 uppercase">{m.timestamp?.toDate().toLocaleDateString()}</span>
                                          <i className="fas fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-all text-xs"></i>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {messages.length === 0 && <div className="p-12 text-center text-slate-300 text-xs uppercase tracking-widest">Clear Inbox</div>}
                      </div>
                  </div>
              )}

              {/* VIEW: PROJECT EDITOR (FULL PAGE FORM) */}
              {currentView === 'project-editor' && (
                  <div className="animate-fade-up max-w-3xl mx-auto pb-12">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                          <h1 className="text-lg font-bold text-slate-800">{editingProject ? 'Update Specification' : 'New Deployment'}</h1>
                          <div className="flex gap-2">
                              <button onClick={() => setCurrentView('projects-list')} className="px-4 py-1.5 rounded border border-slate-300 text-slate-500 text-xs font-bold hover:bg-slate-50">Cancel</button>
                              <button onClick={handleSaveProject} className="px-5 py-1.5 bg-blue-600 text-white rounded text-xs font-bold shadow-sm hover:bg-blue-700">Commit</button>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <section className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-600 uppercase">Title</label>
                                      <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Name..." />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-600 uppercase">Asset URL</label>
                                      <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Image..." />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-600 uppercase">Live</label>
                                      <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Link..." />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-600 uppercase">Code</label>
                                      <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Repo..." />
                                  </div>
                              </div>
                              <div className="space-y-1 pt-2">
                                  <label className="text-[10px] font-bold text-slate-600 uppercase">Summary</label>
                                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs h-20 outline-none focus:ring-1 focus:ring-blue-500" placeholder="Brief..." />
                              </div>
                          </section>

                          <section className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stack & Performance</p>
                               <div className="space-y-4">
                                   <div className="space-y-2">
                                       <label className="text-[10px] font-bold text-slate-600 uppercase">Technologies</label>
                                       <div className="flex gap-2">
                                          <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setTechStackList([...techStackList, techInput]), setTechInput(''))} className="flex-1 p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="Add..." />
                                          <button onClick={() => { setTechStackList([...techStackList, techInput]); setTechInput(''); }} className="px-3 bg-slate-100 rounded text-xs font-bold">+</button>
                                       </div>
                                       <div className="flex flex-wrap gap-1.5 mt-2">
                                           {techStackList.map(t => (
                                               <span key={t} className="px-2 py-0.5 bg-blue-50 text-[9px] font-bold uppercase text-blue-600 rounded flex items-center gap-2">
                                                   {t} <button onClick={() => setTechStackList(techStackList.filter(i => i !== t))} className="text-slate-400">×</button>
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                          </section>

                          <section className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-6">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Narrative</p>
                              <div className="space-y-4">
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-red-500 uppercase">Challenge</label>
                                      <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs h-24 outline-none focus:ring-1 focus:ring-red-500" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-green-600 uppercase">Solution</label>
                                      <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs h-24 outline-none focus:ring-1 focus:ring-green-500" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-blue-600 uppercase">Results</label>
                                      <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs h-24 outline-none focus:ring-1 focus:ring-blue-500" />
                                  </div>
                              </div>
                          </section>
                      </div>
                  </div>
              )}

              {/* VIEW: MESSAGE VIEWER (MAC-STYLE AS REQUESTED) */}
              {currentView === 'message-viewer' && selectedMessage && (
                  <div className="animate-fade-up flex justify-center pt-4">
                      <div className="w-full max-w-2xl bg-[#1c1c1e] text-white rounded-xl shadow-2xl overflow-hidden border border-white/10 flex flex-col relative transition-transform duration-500">
                          
                          {/* macOS Title Bar */}
                          <div className="bg-[#2c2c2e] h-11 flex items-center px-4 justify-between border-b border-white/5 relative shrink-0">
                             <div className="flex gap-1.5">
                               <div onClick={() => setCurrentView('messages-list')} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm cursor-pointer hover:opacity-80 transition-opacity"></div>
                               <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
                               <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
                             </div>
                             <div className="flex items-center gap-2 opacity-60">
                                <i className="fas fa-paper-plane text-[10px]"></i>
                                <span className="text-[11px] font-semibold">New Message</span>
                             </div>
                             <div className="w-12 flex justify-end opacity-50">
                               <i onClick={() => setCurrentView('messages-list')} className="fas fa-reply text-[10px] cursor-pointer hover:opacity-100"></i>
                             </div>
                          </div>

                          {/* Headers */}
                          <div className="bg-[#1c1c1e] text-sm">
                             {/* To Field */}
                             <div className="flex items-center border-b border-white/5 px-6 py-4 transition-colors hover:bg-white/5">
                               <span className="text-[#8e8e93] font-medium w-16 text-xs">To:</span>
                               <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs font-medium flex items-center gap-2">
                                 <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">BP</span>
                                 <span>hello@bbhatt.com.np</span>
                               </div>
                             </div>

                             {/* Name Field */}
                             <div className="flex items-center border-b border-white/5 px-6 py-4 transition-colors hover:bg-white/5">
                               <span className="text-[#8e8e93] font-medium w-16 text-xs">Name:</span>
                               <span className="text-white font-medium text-sm">{selectedMessage.name}</span>
                             </div>

                             {/* Email Field */}
                             <div className="flex items-center border-b border-white/5 px-6 py-4 transition-colors hover:bg-white/5">
                               <span className="text-[#8e8e93] font-medium w-16 text-xs">Email:</span>
                               <span className="text-[#0a84ff] font-medium text-sm">{selectedMessage.email}</span>
                             </div>
                          </div>

                          {/* Message Body */}
                          <div className="p-8 min-h-[300px] overflow-y-auto custom-scrollbar">
                             <div className="text-gray-300 leading-relaxed font-sans text-base whitespace-pre-wrap">
                               {selectedMessage.message}
                             </div>
                          </div>

                          {/* Toolbar Footer (Simplified as requested) */}
                          <div className="bg-[#2c2c2e]/50 backdrop-blur-md px-6 py-4 flex justify-between items-center border-t border-white/5 shrink-0">
                             <div className="flex gap-4 text-gray-400 opacity-50">
                                {/* Formatting icons removed as requested */}
                             </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={async () => { if(confirm('Delete Inquiry?')) { await deleteDoc(doc(db, "messages", selectedMessage.id)); fetchMessages(); setCurrentView('messages-list'); } }}
                                  className="px-4 py-2 rounded text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                  Purge
                                </button>
                                <a 
                                  href={`mailto:${selectedMessage.email}`}
                                  className="bg-[#0a84ff] hover:bg-[#0071e3] text-white px-6 py-2 rounded shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-bold text-xs"
                                >
                                  <i className="fas fa-paper-plane text-[10px]"></i> Reply Message
                                </a>
                             </div>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>

    </div>
  );
};

export default Admin;