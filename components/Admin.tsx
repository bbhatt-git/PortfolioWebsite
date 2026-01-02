import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'messages' | 'add-project'>('messages');
  const [messages, setMessages] = useState<any[]>([]);
  
  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    desc: '',
    stack: '',
    liveUrl: '',
    codeUrl: '',
    image: '', // URL for now
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchMessages();
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "projects"), {
        ...projectForm,
        createdAt: serverTimestamp()
      });
      alert('Project added successfully!');
      setProjectForm({ title: '', desc: '', stack: '', liveUrl: '', codeUrl: '', image: '' });
    } catch (err) {
      alert('Error adding project');
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Admin...</div>;

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1c1c1e] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-gray-400 mb-6 text-sm">Secure entry for Bhupesh only.</p>
          
          {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors">
              Authenticate
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-500">
             Note: Create account in Firebase Console first.
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Admin Nav */}
      <nav className="border-b border-white/10 bg-[#1c1c1e]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-xl">Admin<span className="text-blue-500">Panel</span></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.email}</span>
            <button onClick={handleLogout} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full hover:bg-red-500 hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            Messages
          </button>
          <button 
            onClick={() => setActiveTab('add-project')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'add-project' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            Add Project
          </button>
          <a 
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 ml-auto"
          >
            View Site
          </a>
        </div>

        {activeTab === 'messages' && (
          <div className="grid gap-4">
             <h2 className="text-xl font-bold mb-4">Inbox ({messages.length})</h2>
             {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
             {messages.map((msg) => (
               <div key={msg.id} className="bg-[#1c1c1e] p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{msg.name || 'Unknown'}</h3>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp?.toDate 
                        ? msg.timestamp.toDate().toLocaleDateString() 
                        : 'Date unavailable'}
                    </span>
                  </div>
                  <div className="text-blue-400 text-sm mb-4">{msg.email || 'No email'}</div>
                  <p className="text-gray-300 bg-black/30 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'add-project' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Add New Project</h2>
            <form onSubmit={handleAddProject} className="space-y-6 bg-[#1c1c1e] p-8 rounded-xl border border-white/5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={projectForm.title}
                  onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea 
                  value={projectForm.desc}
                  onChange={e => setProjectForm({...projectForm, desc: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none h-32"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tech Stack (dot separated)</label>
                <input 
                  type="text" 
                  value={projectForm.stack}
                  onChange={e => setProjectForm({...projectForm, stack: e.target.value})}
                  placeholder="React • Firebase • Tailwind"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Live URL</label>
                  <input 
                    type="url" 
                    value={projectForm.liveUrl}
                    onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Code URL</label>
                  <input 
                    type="url" 
                    value={projectForm.codeUrl}
                    onChange={e => setProjectForm({...projectForm, codeUrl: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                <input 
                  type="url" 
                  value={projectForm.image}
                  onChange={e => setProjectForm({...projectForm, image: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors">
                Publish Project
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;