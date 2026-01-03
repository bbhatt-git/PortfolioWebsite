import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Projects from './components/Projects';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Layout from './components/Layout';
import CommandPalette from './components/CommandPalette';
import Terminal from './components/Terminal';
import Admin from './components/Admin';
import CV from './components/CV';
import ProjectPage from './components/ProjectPage';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    // Theme Logic
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // Handle Hash Change for Routing
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // Cmd+J or Ctrl+J for Terminal
      if ((e.metaKey || e.ctrlKey) && (e.key === 'j')) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Route Handling
  if (currentRoute === '#/admin') {
    return <Admin />;
  }

  if (currentRoute === '#/cv') {
    return <CV />;
  }

  if (currentRoute.startsWith('#/projects/')) {
    const parts = currentRoute.split('/');
    const projectId = parts[2];
    if (projectId) {
      return <ProjectPage id={projectId} />;
    }
  }

  return (
    <Layout>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        openSearch={() => setIsSearchOpen(true)}
        openTerminal={() => setIsTerminalOpen(true)}
      />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        toggleTheme={toggleTheme} 
      />
      <Terminal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
      />
    </Layout>
  );
};

export default App;