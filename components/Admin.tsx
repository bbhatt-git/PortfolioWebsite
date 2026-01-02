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
  
  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    desc: '',
    liveUrl: '',
    codeUrl: '',
    imageUrl: '',
  });

  // Tech Stack State
  const [techInput, setTechInput] = useState('');
  const [techStackList, setTechStackList] = useState<string[]>([]);

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

  // Drag and Drop Logic
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Fluid visual reordering in state
    const newProjects = [...projects];
    const item = newProjects.splice(draggedIndex, 1)[0];
    newProjects.splice(index, 0, item);
    
    setDraggedIndex(index);
    setProjects(newProjects);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    // Persist final order to Firestore
    try {
      const updates = projects.map((proj, index) => {
        return updateDoc(doc(db, "projects", proj.id), { order: index });
      });
      await Promise.all(updates);
    } catch (err) {
      console.error("Failed to persist project order", err);
      fetchProjects(); // Revert on failure
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Failed to delete project.");
      }
    }
  };

  const handleEditProject = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      desc: proj.desc,
      liveUrl: proj.liveUrl || '',
      codeUrl: proj.codeUrl || '',
      imageUrl: proj.image,
    });
    setTechStackList(proj.stack.split(' • '));
    setIsProjectModalOpen(true);
  };

  const handleAddTech = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.type === 'click' || (e as React.KeyboardEvent).key === 'Enter') {
        e.preventDefault();
        if (techInput.trim() && techStackList.length < 15) {
            setTechStackList([...techStackList, techInput.trim()]);
            setTechInput('');
        }
    }
  };

  const handleRemoveTech = (index: number) => {
    setTechStackList(techStackList.filter((_, i) => i !== index));
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (techStackList.length === 0) {
        alert("Please add at least one technology to the stack.");
        return;
    }

    try {
      const projectImage = projectForm.imageUrl || 'https://via.placeholder.com/1200x800?text=No+Image';
      const stackString = techStackList.join(' • ');

      const projectData = {
        title: projectForm.title,
        desc: projectForm.desc,
        liveUrl: projectForm.liveUrl,
        codeUrl: projectForm.codeUrl,
        image: projectImage,
        stack: stackString,
        // If new project, add it to the end
        ...(editingProject ? {} : { order: projects.length })
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
      } else {
        await addDoc(collection(db, "projects"), {
          ...projectData,
          createdAt: serverTimestamp()
        });
      }
      
      fetchProjects(); 
      closeProjectModal();
    } catch (err) {
      alert('Error saving project');
    }
  };

  const closeProjectModal = () => {
    setProjectForm({ title: '', desc: '', liveUrl: '', codeUrl: '', imageUrl: '' });
    setTechStackList([]);
    setTechInput('');
    setEditingProject(null);
    setIsProjectModalOpen(false);
  };

  const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#F2F2F7] dark:bg-[#050505]">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[10%] right-[-20%] w-[60vw] h-[60vw] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.4] mix-blend-overlay"></div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
        <AmbientBackground />
        
        <div className="w-full max-w-md relative z-10">
            <div className="glass-strong rounded-3xl p-8 md:p-12 animate-scale-in shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="text-center mb-10">
                   <div className="w-20 h-20 glass rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg">
                      <span className="font-mono font-bold text-3xl text-gray-800 dark:text-white">BR</span>
                   </div>
                   <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Portal</h1>
                   <p className="text-gray-500 dark:text-gray-400 text-sm">Authenticate to manage content</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                   <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Email</label>
                       <input 
                         type="email" 
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400/70 backdrop-blur-sm"
                         placeholder="admin@example.com"
                         required
                       />
                   </div>
                   <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Password</label>
                       <input 
                         type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400/70 backdrop-blur-sm"
                         placeholder="••••••••"
                         required
                       />
                   </div>
                   
                   <button type="submit" className="w-full bg-blue-600/90 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md">
                       Enter Dashboard
                   </button>
                </form>
                
                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center font-medium backdrop-blur-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
        <AmbientBackground />
        
        {/* GLASS SIDEBAR */}
        <aside className="w-20 lg:w-72 glass-strong border-r border-white/20 dark:border-white/5 flex flex-col flex-shrink-0 z-20 transition-all duration-300">
            <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="font-mono font-bold text-sm text-white">BR</span>
                </div>
                <div className="ml-4 hidden lg:block">
                    <h1 className="font-bold text-lg leading-tight">Bhupesh</h1>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Admin</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button 
                  onClick={() => setActiveTab('inbox')}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'inbox' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-inbox w-5 text-center text-lg lg:text-base"></i>
                  <span className="hidden lg:block">Inbox</span>
                  {messages.length > 0 && (
                    <span className={`ml-auto py-0.5 px-2.5 rounded-full text-xs font-bold hidden lg:block ${
                        activeTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                    }`}>
                        {messages.length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setActiveTab('projects')}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'projects' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-layer-group w-5 text-center text-lg lg:text-base"></i>
                  <span className="hidden lg:block">Projects</span>
                  {projects.length > 0 && (
                     <span className={`ml-auto py-0.5 px-2.5 rounded-full text-xs font-bold hidden lg:block ${
                        activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                    }`}>
                        {projects.length}
                    </span>
                  )}
                </button>
            </nav>

            <div className="p-6">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                >
                   <i className="fas fa-sign-out-alt w-5 text-center"></i>
                   <span className="hidden lg:block">Log Out</span>
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
            {/* Header */}
            <header className="h-24 flex items-center justify-between px-8 md:px-12">
                <div>
                    <h2 className="text-3xl font-bold capitalize bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                        {activeTab}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overview of your {activeTab}</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 custom-scrollbar">
                
                {activeTab === 'inbox' && (
                    <div className="max-w-6xl mx-auto animate-fade-up">
                        <div className="glass rounded-3xl overflow-hidden border border-white/40 dark:border-white/5">
                           {messages.length === 0 ? (
                             <div className="p-20 text-center text-gray-400">
                               <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <i className="fas fa-inbox text-3xl opacity-50"></i>
                               </div>
                               <p className="text-lg font-medium">Your inbox is empty</p>
                             </div>
                           ) : (
                             <div className="divide-y divide-gray-200/50 dark:divide-white/5">
                               {messages.map((msg) => (
                                 <div 
                                   key={msg.id}
                                   onClick={() => setSelectedMessage(msg)}
                                   className="p-6 hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer transition-colors flex flex-col md:flex-row gap-4 md:items-center group"
                                 >
                                    <div className="flex items-center gap-4 md:w-1/3">
                                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                                          {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                                       </div>
                                       <div className="min-w-0">
                                          <p className="font-bold text-gray-900 dark:text-white truncate">{msg.name}</p>
                                          <p className="text-xs text-blue-600 dark:text-blue-400 truncate font-medium">{msg.email}</p>
                                       </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium opacity-80 group-hover:opacity-100">{msg.message}</p>
                                    </div>
                                    <div className="text-xs font-semibold text-gray-400 md:text-right md:w-32 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full w-fit">
                                       {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : 'Now'}
                                    </div>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="max-w-[1600px] mx-auto animate-fade-up">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                           <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                             <i className="fas fa-info-circle text-lg"></i>
                             <p className="text-sm font-bold tracking-tight">Drag and drop projects to change their display order on the website.</p>
                           </div>
                           <button 
                             onClick={() => setIsProjectModalOpen(true)}
                             className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2 whitespace-nowrap"
                           >
                             <i className="fas fa-plus"></i> New Project
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                           {projects.map((proj, index) => (
                              <div 
                                key={proj.id} 
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`glass rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col relative border border-white/40 dark:border-white/5 cursor-grab active:cursor-grabbing will-change-transform ${draggedIndex === index ? 'opacity-40 scale-95 border-blue-500/50' : 'opacity-100 scale-100'}`}
                              >
                                 <div className="h-56 bg-gray-100 dark:bg-black/50 relative overflow-hidden pointer-events-none">
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60"></div>
                                     <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                     
                                     <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-auto">
                                         <button 
                                              onClick={(e) => handleEditProject(proj, e)}
                                              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-blue-500 transition-colors border border-white/30"
                                         >
                                              <i className="fas fa-edit text-sm"></i>
                                         </button>
                                         <button 
                                              onClick={(e) => handleDeleteProject(proj.id, e)}
                                              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors border border-white/30"
                                         >
                                              <i className="fas fa-trash-alt text-sm"></i>
                                         </button>
                                     </div>

                                     <div className="absolute bottom-4 left-4 z-20">
                                         <h3 className="font-bold text-xl text-white mb-1 drop-shadow-md tracking-tight">{proj.title}</h3>
                                         <div className="flex items-center gap-2">
                                           <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">RANK {index + 1}</span>
                                           <i className="fas fa-grip-lines text-white/50 text-xs"></i>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="p-6 flex-1 flex flex-col pointer-events-none">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">{proj.desc}</p>
                                    
                                    <div className="flex gap-2 pointer-events-auto">
                                       {proj.liveUrl && (
                                         <a href={proj.liveUrl} target="_blank" className="flex-1 text-center text-[11px] py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-black uppercase tracking-wider hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                                           Live Demo
                                         </a>
                                       )}
                                       {proj.codeUrl && (
                                         <a href={proj.codeUrl} target="_blank" className="flex-1 text-center text-[11px] py-2.5 bg-gray-500/10 text-gray-700 dark:text-gray-300 rounded-lg font-black uppercase tracking-wider hover:bg-gray-500/20 transition-colors border border-gray-500/20">
                                           Source
                                         </a>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* --- MESSAGE DETAIL MODAL --- */}
        {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-scale-in">
                <div className="glass-strong w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                   <div className="px-8 py-6 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-white/30 dark:bg-black/30">
                       <h3 className="font-bold text-xl">Message Detail</h3>
                       <button onClick={() => setSelectedMessage(null)} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                          <i className="fas fa-times text-sm"></i>
                       </button>
                   </div>
                   <div className="p-8 overflow-y-auto">
                       <div className="flex items-center gap-5 mb-8">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                               {selectedMessage.name ? selectedMessage.name.charAt(0).toUpperCase() : '?'}
                           </div>
                           <div>
                               <h4 className="font-bold text-2xl tracking-tight">{selectedMessage.name}</h4>
                               <p className="text-blue-600 dark:text-blue-400 font-medium">{selectedMessage.email}</p>
                               <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide font-black">{selectedMessage.timestamp?.toDate ? selectedMessage.timestamp.toDate().toLocaleString() : ''}</p>
                           </div>
                       </div>
                       <div className="bg-white/50 dark:bg-black/20 p-6 rounded-2xl border border-white/20 dark:border-white/5 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                           {selectedMessage.message}
                       </div>
                   </div>
                   <div className="p-6 border-t border-gray-200/50 dark:border-white/10 flex justify-end bg-white/30 dark:bg-black/30">
                        <a 
                          href={`mailto:${selectedMessage.email}`}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                        >
                           <i className="fas fa-reply"></i> Reply
                        </a>
                   </div>
                </div>
            </div>
        )}

        {/* --- ADD/EDIT PROJECT MODAL --- */}
        {isProjectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-scale-in">
                <div className="glass-strong w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                   <div className="px-8 py-6 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-white/30 dark:bg-black/30">
                       <h3 className="font-bold text-xl">{editingProject ? 'Edit Project' : 'New Project'}</h3>
                       <button onClick={closeProjectModal} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                          <i className="fas fa-times text-sm"></i>
                       </button>
                   </div>
                   <div className="p-8 overflow-y-auto">
                      <form onSubmit={handleSaveProject} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Title</label>
                            <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Description</label>
                            <textarea value={projectForm.desc} onChange={e => setProjectForm({...projectForm, desc: e.target.value})} className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors h-28 resize-none" required />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Tech Stack ({techStackList.length}/15)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={techInput} 
                                    onChange={e => setTechInput(e.target.value)} 
                                    onKeyDown={handleAddTech}
                                    placeholder="e.g. React" 
                                    className="flex-1 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" 
                                    disabled={techStackList.length >= 15}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddTech}
                                    disabled={!techInput.trim() || techStackList.length >= 15}
                                    className="w-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center hover:opacity-80 disabled:opacity-50 transition-opacity font-bold text-lg"
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 min-h-[60px]">
                                {techStackList.map((tech, idx) => (
                                    <div key={idx} className="bg-white dark:bg-white/10 text-gray-800 dark:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-gray-200 dark:border-white/10 shadow-sm animate-scale-in">
                                        {tech}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTech(idx)}
                                            className="hover:text-red-500 transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                        >
                                            <i className="fas fa-times text-[10px]"></i>
                                        </button>
                                    </div>
                                ))}
                                {techStackList.length === 0 && (
                                    <span className="text-xs text-gray-400 font-medium italic">No technologies added yet.</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Image URL</label>
                            <input 
                              type="url" 
                              value={projectForm.imageUrl} 
                              onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} 
                              className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" 
                              placeholder="https://example.com/image.png"
                              required 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Live URL</label>
                                <input type="url" value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Code URL</label>
                                <input type="url" value={projectForm.codeUrl} onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})} className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={closeProjectModal} className="px-6 py-3 rounded-xl text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" className="px-8 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all hover:scale-105 shadow-lg shadow-blue-500/20">{editingProject ? 'Save Changes' : 'Publish Project'}</button>
                        </div>
                      </form>
                   </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Admin;