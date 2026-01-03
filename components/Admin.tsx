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
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'inbox' | 'projects'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // UI State
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, projectId: string | null}>({ isOpen: false, projectId: null });
  
  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    desc: '',
    liveUrl: '',
    codeUrl: '',
    imageUrl: '',
  });

  const [caseStudyForm, setCaseStudyForm] = useState({
    challenge: '',
    solution: '',
    results: ''
  });

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
      setError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.hash = ''; 
  };

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const msgs: any[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      if (msgs.length > 0) setSelectedMessage(msgs[0]);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, "projects"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const projs: Project[] = [];
      querySnapshot.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projs);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newProjects = [...projects];
    const item = newProjects.splice(draggedIndex, 1)[0];
    newProjects.splice(index, 0, item);
    setDraggedIndex(index);
    setProjects(newProjects);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const updates = projects.map((proj, index) => updateDoc(doc(db, "projects", proj.id), { order: index }));
      await Promise.all(updates);
    } catch (err) {
      console.error("Failed to persist order", err);
      fetchProjects();
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.projectId) {
      try {
        await deleteDoc(doc(db, "projects", deleteConfirm.projectId));
        setProjects(prev => prev.filter(p => p.id !== deleteConfirm.projectId));
      } catch (err) { alert("Failed to delete."); }
    }
    setDeleteConfirm({ isOpen: false, projectId: null });
  };

  const handleEditProject = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setProjectForm({ title: proj.title, desc: proj.desc, liveUrl: proj.liveUrl || '', codeUrl: proj.codeUrl || '', imageUrl: proj.image });
    setCaseStudyForm({ challenge: proj.caseStudy?.challenge || '', solution: proj.caseStudy?.solution || '', results: proj.caseStudy?.results || '' });
    setTechStackList(proj.stack.split(/[•,]/).map(s => s.trim()).filter(Boolean));
    setHighlightsList(proj.highlights || []);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (techStackList.length === 0) return alert("Add at least one tech.");
    try {
      const projectData = {
        title: projectForm.title,
        desc: projectForm.desc,
        liveUrl: projectForm.liveUrl,
        codeUrl: projectForm.codeUrl,
        image: projectForm.imageUrl || 'https://via.placeholder.com/1200x800',
        stack: techStackList.join(' • '),
        highlights: highlightsList,
        caseStudy: caseStudyForm,
        ...(editingProject ? {} : { order: projects.length })
      };
      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
      } else {
        await addDoc(collection(db, "projects"), { ...projectData, createdAt: serverTimestamp() });
      }
      fetchProjects(); 
      closeProjectModal();
    } catch (err) { console.error(err); }
  };

  const closeProjectModal = () => {
    setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
    setCaseStudyForm({ challenge: '', solution: '', results: '' });
    setTechStackList([]); setHighlightsList([]);
    setEditingProject(null); setIsProjectModalOpen(false);
  };

  const TrafficLights = ({ onAction }: { onAction?: () => void }) => (
    <div className="flex gap-1.5 px-4 py-3 shrink-0">
      <div onClick={onAction} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] cursor-pointer hover:bg-[#FF4A40] transition-colors shadow-sm"></div>
      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
      <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm"></div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#050505]">
        <div className="w-full max-w-md relative z-10">
          <div className="glass-strong rounded-3xl p-8 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 glass rounded-2xl mx-auto flex items-center justify-center mb-4"><span className="font-mono font-bold text-2xl">BR</span></div>
              <h1 className="text-2xl font-bold">Admin Portal</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass bg-white/20 px-4 py-3 rounded-xl outline-none" placeholder="Email" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass bg-white/20 px-4 py-3 rounded-xl outline-none" placeholder="Password" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Login</button>
            </form>
            {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm text-center">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F2F2F7] dark:bg-[#050505] overflow-hidden font-sans">
      
      {/* 1. SIDEBAR (macOS Mail Navigator) */}
      <aside className="w-64 glass-strong border-r border-black/5 dark:border-white/5 flex flex-col z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-mono font-bold">BR</span></div>
            <div><h2 className="font-bold">Bhupesh</h2><p className="text-[10px] uppercase font-black opacity-40">Admin Dashboard</p></div>
          </div>
          
          <nav className="space-y-1">
             <button onClick={() => setActiveTab('inbox')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'inbox' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'}`}>
                <i className="fas fa-inbox w-5"></i> Inbox
                <span className="ml-auto opacity-60 text-xs font-bold">{messages.length}</span>
             </button>
             <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'}`}>
                <i className="fas fa-layer-group w-5"></i> Projects
             </button>
          </nav>
        </div>
        
        <div className="mt-auto p-4">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-bold">
              <i className="fas fa-sign-out-alt w-5"></i> Logout
           </button>
        </div>
      </aside>

      {/* 2. LIST PANE (macOS Mail List) */}
      <div className="w-80 bg-white/50 dark:bg-black/20 border-r border-black/5 dark:border-white/5 flex flex-col z-20 overflow-hidden">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-widest opacity-40">{activeTab}</h3>
            {activeTab === 'projects' && (
               <button onClick={() => setIsProjectModalOpen(true)} className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><i className="fas fa-plus text-xs"></i></button>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {activeTab === 'inbox' ? (
              messages.map(msg => (
                <div key={msg.id} onClick={() => setSelectedMessage(msg)} className={`p-4 border-b border-black/5 dark:border-white/5 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-blue-500/10 dark:bg-blue-500/20' : 'hover:bg-white dark:hover:bg-white/5'}`}>
                   <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm truncate pr-2">{msg.name}</span>
                      <span className="text-[10px] opacity-40 whitespace-nowrap">{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : 'Now'}</span>
                   </div>
                   <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 truncate">{msg.email}</p>
                   <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">{msg.message}</p>
                </div>
              ))
           ) : (
              projects.map((proj, idx) => (
                <div 
                  key={proj.id} 
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleEditProject(proj, e)} 
                  className={`p-4 border-b border-black/5 dark:border-white/5 cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-white/5 transition-colors ${draggedIndex === idx ? 'opacity-40' : ''}`}
                >
                   <div className="flex gap-3">
                      <img src={proj.image} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                      <div className="min-w-0">
                         <h4 className="font-bold text-sm truncate">{proj.title}</h4>
                         <p className="text-[10px] opacity-40 truncate">{proj.stack}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, projectId: proj.id }); }} className="ml-auto text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600"><i className="fas fa-trash"></i></button>
                   </div>
                </div>
              ))
           )}
        </div>
      </div>

      {/* 3. CONTENT PANE (macOS Mail View) */}
      <main className="flex-1 bg-white dark:bg-[#121212] overflow-hidden flex flex-col z-10">
         {activeTab === 'inbox' && selectedMessage ? (
            <div className="flex-1 flex flex-col animate-fade-up">
               {/* Mail Header */}
               <div className="p-8 border-b border-black/5 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                     <h2 className="text-3xl font-bold tracking-tight">{selectedMessage.name}</h2>
                     <div className="text-sm opacity-40">{selectedMessage.timestamp?.toDate ? selectedMessage.timestamp.toDate().toLocaleString() : 'Now'}</div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                     <div className="flex gap-4"><span className="opacity-40 w-12 font-bold uppercase text-[10px]">From:</span> <span className="font-bold text-blue-600">{selectedMessage.email}</span></div>
                     <div className="flex gap-4"><span className="opacity-40 w-12 font-bold uppercase text-[10px]">To:</span> <span className="opacity-40">Bhupesh Bhatt &lt;hello@bbhatt.com.np&gt;</span></div>
                     <div className="flex gap-4"><span className="opacity-40 w-12 font-bold uppercase text-[10px]">Subject:</span> <span className="font-bold">Portfolio Feedback / Contact</span></div>
                  </div>
               </div>
               
               {/* Mail Body */}
               <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                  <div className="max-w-3xl leading-relaxed text-lg whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                     {selectedMessage.message}
                  </div>
               </div>

               {/* Mail Actions */}
               <div className="p-6 bg-[#F2F2F7] dark:bg-black/20 border-t border-black/5 dark:border-white/5 flex justify-end gap-3">
                  <button className="px-6 py-2 rounded-lg glass font-bold text-sm opacity-60 hover:opacity-100"><i className="fas fa-archive mr-2"></i> Archive</button>
                  <a href={`mailto:${selectedMessage.email}`} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-lg hover:bg-blue-500 transition-colors"><i className="fas fa-reply mr-2"></i> Reply Message</a>
               </div>
            </div>
         ) : activeTab === 'projects' ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 p-12 text-center">
               <i className="fas fa-layer-group text-6xl mb-6"></i>
               <h3 className="text-2xl font-bold">Project Management</h3>
               <p className="max-w-xs mx-auto mt-2">Select a project from the left pane to edit details, or click the plus button to create a new deployment.</p>
            </div>
         ) : (
            <div className="flex-1 flex items-center justify-center opacity-20"><i className="fas fa-envelope-open-text text-[10vw]"></i></div>
         )}
      </main>

      {/* --- MODAL: PROJECT EDITOR (macOS Compose Window Style) --- */}
      {isProjectModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-scale-in">
            <div className="w-full max-w-4xl bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl flex flex-col border border-white/20 dark:border-white/10 overflow-hidden max-h-[90vh]">
               
               <TrafficLights onAction={closeProjectModal} />
               
               <div className="px-8 pb-6 border-b border-black/5 dark:border-white/5">
                  <h2 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'New Deployment'}</h2>
                  <div className="space-y-3">
                     <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-2">
                        <span className="text-xs font-bold opacity-40 uppercase w-16">To:</span>
                        <div className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">Selected Work Portfolio</div>
                     </div>
                     <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-2">
                        <span className="text-xs font-bold opacity-40 uppercase w-16">Subject:</span>
                        <input value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="flex-1 bg-transparent text-sm outline-none font-bold" placeholder="Project Name..." />
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#F2F2F7] dark:bg-black/20">
                  <div className="max-w-3xl mx-auto space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Narrative Description</label>
                         <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full min-h-[120px] bg-white dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/10 text-sm leading-relaxed outline-none focus:ring-2 ring-blue-500/20" placeholder="Describe the journey of this project..." />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Thumbnail URL</label>
                            <input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/10 text-xs" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tech Stack (comma separated)</label>
                            <input 
                               value={techStackList.join(', ')} 
                               onChange={e => setTechStackList(e.target.value.split(',').map(s => s.trim()))} 
                               className="w-full bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/10 text-xs" 
                               placeholder="React, Node.js..."
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Deployment Link</label>
                            <input value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/10 text-xs" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Source Code Repository</label>
                            <input value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/10 text-xs" />
                         </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-black/5">
                         <h4 className="font-bold text-sm">Case Study Specifications</h4>
                         <div className="space-y-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-blue-500 uppercase">Architecture Challenge</label>
                               <textarea value={caseStudyForm.challenge} onChange={e => setCaseStudyForm({...caseStudyForm, challenge: e.target.value})} className="w-full min-h-[80px] bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 text-xs outline-none" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-green-500 uppercase">Implemented Solution</label>
                               <textarea value={caseStudyForm.solution} onChange={e => setCaseStudyForm({...caseStudyForm, solution: e.target.value})} className="w-full min-h-[80px] bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 text-xs outline-none" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-purple-500 uppercase">Metric Results</label>
                               <textarea value={caseStudyForm.results} onChange={e => setCaseStudyForm({...caseStudyForm, results: e.target.value})} className="w-full min-h-[80px] bg-white dark:bg-white/5 p-3 rounded-lg border border-black/5 text-xs outline-none" />
                            </div>
                         </div>
                      </div>
                  </div>
               </div>

               <div className="p-4 bg-white dark:bg-[#1C1C1E] border-t border-black/5 flex justify-end gap-3">
                  <button onClick={closeProjectModal} className="px-6 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold">Discard Draft</button>
                  <button onClick={handleSaveProject} className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xl hover:bg-blue-500 transition-colors">Ship Project <i className="fas fa-paper-plane ml-2"></i></button>
               </div>
            </div>
         </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteConfirm.isOpen && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-scale-in">
            <div className="glass-strong w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
               <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center text-2xl mx-auto mb-6"><i className="fas fa-exclamation-triangle"></i></div>
               <h3 className="text-xl font-bold mb-2">Delete Deployment?</h3>
               <p className="text-gray-500 text-sm mb-8">This action is permanent and will remove the project from the public work section.</p>
               <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm({isOpen: false, projectId: null})} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-sm font-bold">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-bold">Confirm Delete</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Admin;