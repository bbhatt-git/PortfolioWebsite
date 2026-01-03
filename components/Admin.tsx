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
  
  const [activeTab, setActiveTab] = useState<'inbox' | 'projects'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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
      setError('Access Denied: Invalid Credentials.');
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

  const addTech = () => {
    if (techInput.trim() && !techStackList.includes(techInput.trim())) {
      setTechStackList([...techStackList, techInput.trim()]);
      setTechInput('');
    }
  };

  const addHighlight = () => {
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
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || techStackList.length === 0) return alert("Title and at least one tech required.");
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
    closeProjectModal();
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setTechStackList([]); setHighlightsList([]);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-500"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-[#050505] p-6">
      <div className="glass-strong p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-white font-bold">BR</div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none focus:ring-2 ring-blue-500/20" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 outline-none focus:ring-2 ring-blue-500/20" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-all">Authenticate</button>
        </form>
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F2F2F7] dark:bg-[#050505] text-[#1D1D1F] dark:text-[#F5F5F7] overflow-hidden">
      
      {/* 1. SIDEBAR: Mail Folders */}
      <aside className="w-64 glass-strong border-r border-black/5 dark:border-white/5 flex flex-col z-30">
        <div className="p-6 pt-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">BR</div>
            <div><h2 className="font-bold text-sm">Bhupesh Bhatt</h2><p className="text-[9px] uppercase font-black opacity-40 tracking-widest">Administrator</p></div>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('inbox')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === 'inbox' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-black/5 opacity-70'}`}>
              <i className="fas fa-inbox w-4"></i> Inbox <span className="ml-auto text-[10px] font-black">{messages.length}</span>
            </button>
            <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-black/5 opacity-70'}`}>
              <i className="fas fa-briefcase w-4"></i> Projects
            </button>
          </nav>
        </div>
        <button onClick={() => signOut(auth)} className="mt-auto m-6 p-3 text-red-500 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all"><i className="fas fa-sign-out-alt mr-2"></i> Log Out</button>
      </aside>

      {/* 2. LIST PANE: Message Summaries */}
      <div className="w-80 bg-white/40 dark:bg-black/10 border-r border-black/5 dark:border-white/5 flex flex-col z-20 overflow-hidden">
        <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
          <h3 className="font-bold text-xs uppercase tracking-widest opacity-40">{activeTab}</h3>
          {activeTab === 'projects' && (
            <button onClick={() => setIsProjectModalOpen(true)} className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"><i className="fas fa-plus text-[10px]"></i></button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'inbox' ? messages.map(msg => (
            <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-5 border-b border-black/5 dark:border-white/5 cursor-pointer transition-all ${selectedMessage?.id === msg.id ? 'bg-blue-600/10' : 'hover:bg-white/50'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm truncate pr-2">{msg.name}</span>
                <span className="text-[10px] opacity-40">{msg.timestamp?.toDate().toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1 truncate">{msg.email}</p>
              <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">{msg.message}</p>
            </div>
          )) : projects.map(proj => (
            <div key={proj.id} onClick={() => handleEditProject(proj)} className="p-5 border-b border-black/5 dark:border-white/5 cursor-pointer hover:bg-white/50 transition-all flex gap-3 group">
              <img src={proj.image} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-black/5" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm truncate">{proj.title}</h4>
                <p className="text-[10px] opacity-40 truncate">{proj.stack}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, projectId: proj.id }); }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-trash-alt text-xs"></i></button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONTENT PANE: Mail View */}
      <main className="flex-1 bg-white dark:bg-[#121212] overflow-hidden flex flex-col z-10">
        {activeTab === 'inbox' && selectedMessage ? (
          <div className="flex-1 flex flex-col animate-fade-up">
            <div className="p-10 border-b border-black/5 dark:border-white/5 bg-[#FBFBFD] dark:bg-black/20">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-4xl font-bold tracking-tight">{selectedMessage.name}</h2>
                <div className="text-sm opacity-40 font-mono">{selectedMessage.timestamp?.toDate().toLocaleString()}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-4"><span className="opacity-40 w-16 uppercase text-[10px] font-black">From:</span> <span className="font-bold text-blue-600">{selectedMessage.email}</span></div>
                <div className="flex gap-4"><span className="opacity-40 w-16 uppercase text-[10px] font-black">To:</span> <span className="opacity-40">Bhupesh Bhatt &lt;hello@bbhatt.com.np&gt;</span></div>
                <div className="flex gap-4"><span className="opacity-40 w-16 uppercase text-[10px] font-black">Subject:</span> <span className="font-bold">New Portfolio Inquiry</span></div>
              </div>
            </div>
            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {selectedMessage.message}
            </div>
            <div className="p-6 border-t border-black/5 flex justify-end gap-3 bg-[#FBFBFD] dark:bg-black/20">
              <a href={`mailto:${selectedMessage.email}`} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl flex items-center gap-2"><i className="fas fa-reply"></i> Reply in Mail</a>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <i className="fas fa-envelope-open-text text-8xl mb-6"></i>
            <h3 className="text-xl font-bold">No Message Selected</h3>
          </div>
        )}
      </main>

      {/* MODAL: COMPOSE WINDOW (Project Editor) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-scale-in">
          <div className="w-full max-w-4xl bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl flex flex-col border border-white/20 dark:border-white/10 overflow-hidden h-[90vh]">
            {/* macOS Title Bar */}
            <div className="h-12 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center px-4 relative shrink-0">
               <div className="flex gap-1.5">
                  <div onClick={closeProjectModal} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
               </div>
               <div className="absolute left-1/2 -translate-x-1/2 text-[11px] font-bold opacity-40 uppercase tracking-widest">Compose — Project Deployment</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
               {/* 1. Project Basics Section */}
               <section className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-3">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 w-20">Title:</span>
                     <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent font-bold outline-none text-xl" placeholder="E-Commerce AI Tool..." />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Thumbnail URL</label>
                        <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 text-sm outline-none" placeholder="https://..." />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Live Preview</label>
                            <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 text-sm outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Source Code</label>
                            <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 text-sm outline-none" />
                        </div>
                     </div>
                  </div>
               </section>

               {/* 2. TECH STACK: Interactive Pill Creator */}
               <section className="p-6 rounded-2xl bg-[#F2F2F7] dark:bg-black/20 border border-black/5">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-microchip text-blue-500"></i> Tech Arsenal
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                     {techStackList.map(tech => (
                        <div key={tech} className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center gap-2 shadow-sm">
                           {tech} <button onClick={() => setTechStackList(techStackList.filter(t => t !== tech))}><i className="fas fa-times opacity-60"></i></button>
                        </div>
                     ))}
                     {techStackList.length === 0 && <span className="text-xs opacity-40 italic">No technologies added yet...</span>}
                  </div>
                  <div className="flex gap-2">
                     <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTech()} className="flex-1 bg-white dark:bg-white/5 p-3 rounded-xl border border-black/5 text-sm outline-none" placeholder="Type tech name (e.g. React)..." />
                     <button onClick={addTech} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs">Add</button>
                  </div>
               </section>

               {/* 3. KEY HIGHLIGHTS: Bullet List Creator */}
               <section className="p-6 rounded-2xl bg-[#F2F2F7] dark:bg-black/20 border border-black/5">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-star text-yellow-500"></i> Key Achievements
                  </h4>
                  <div className="space-y-2 mb-4">
                     {highlightsList.map((h, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-black/5 text-sm flex justify-between items-center">
                           <span className="flex items-center gap-3"><i className="fas fa-check-circle text-green-500 text-xs"></i> {h}</span>
                           <button onClick={() => setHighlightsList(highlightsList.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                        </div>
                     ))}
                     {highlightsList.length === 0 && <span className="text-xs opacity-40 italic">No highlights defined...</span>}
                  </div>
                  <div className="flex gap-2">
                     <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHighlight()} className="flex-1 bg-white dark:bg-white/5 p-3 rounded-xl border border-black/5 text-sm outline-none" placeholder="e.g. Improved performance by 40%..." />
                     <button onClick={addHighlight} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs">Push</button>
                  </div>
               </section>

               {/* 4. Case Study Details */}
               <section className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-40">Narrative & Performance</h4>
                  <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full min-h-[120px] bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 text-base leading-relaxed outline-none" placeholder="Project Summary..." />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Challenge</label>
                        <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full h-24 bg-black/5 dark:bg-white/5 p-3 rounded-xl text-xs outline-none" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-green-500 uppercase tracking-widest">Solution</label>
                        <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full h-24 bg-black/5 dark:bg-white/5 p-3 rounded-xl text-xs outline-none" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Results</label>
                        <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full h-24 bg-black/5 dark:bg-white/5 p-3 rounded-xl text-xs outline-none" />
                     </div>
                  </div>
               </section>
            </div>

            {/* Modal Footer (Compose Actions) */}
            <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 flex justify-end gap-3">
               <button onClick={closeProjectModal} className="px-6 py-2.5 rounded-xl hover:bg-black/5 font-bold text-sm">Discard</button>
               <button onClick={handleSaveProject} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-blue-500 transition-all flex items-center gap-2"><i className="fas fa-paper-plane"></i> Deploy Project</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="glass-strong p-10 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl border border-white/20">
              <i className="fas fa-trash-alt text-4xl text-red-500 mb-6"></i>
              <h3 className="text-xl font-bold mb-2">Confirm Removal</h3>
              <p className="text-sm opacity-60 mb-8">This action is permanent and will remove the deployment from public access.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm({isOpen: false, projectId: null})} className="flex-1 p-4 bg-black/5 rounded-xl font-bold text-sm">Cancel</button>
                <button onClick={async () => {
                   if (deleteConfirm.projectId) {
                      await deleteDoc(doc(db, "projects", deleteConfirm.projectId));
                      fetchProjects();
                      setDeleteConfirm({isOpen: false, projectId: null});
                   }
                }} className="flex-1 p-4 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg">Delete</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Admin;