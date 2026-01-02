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

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#/admin');

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

    // Handle Hash Change for Admin Route
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#/admin');
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

  // Render Admin Panel if hash is #/admin
  if (isAdmin) {
    return <Admin />;
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