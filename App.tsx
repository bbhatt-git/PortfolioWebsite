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
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use pathname instead of hash for routing
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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

    // Handle Route Changes (History API)
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    // Listen for browser back/forward
    window.addEventListener('popstate', handleLocationChange);
    // Listen for custom pushstate events from components
    window.addEventListener('pushstate', handleLocationChange);

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
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
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
  if (currentPath === '/admin') {
    return (
      <>
        {isLoading && <Preloader onLoadingComplete={() => setIsLoading(false)} />}
        <CustomCursor />
        <Admin />
      </>
    );
  }

  if (currentPath === '/cv') {
    return (
      <>
        {isLoading && <Preloader onLoadingComplete={() => setIsLoading(false)} />}
        <CustomCursor />
        <CV />
      </>
    );
  }

  // Check for /project/slug
  if (currentPath.startsWith('/project/')) {
    const rawSlug = currentPath.split('/project/')[1];
    const slug = rawSlug ? rawSlug.split('?')[0].replace(/\/$/, '') : '';
    
    if (slug) {
      return (
        <>
          {isLoading && <Preloader onLoadingComplete={() => setIsLoading(false)} />}
          <CustomCursor />
          <ProjectPage slug={slug} />
        </>
      );
    }
  }

  return (
    <>
      {isLoading && <Preloader onLoadingComplete={() => setIsLoading(false)} />}
      <CustomCursor />
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
    </>
  );
};

export default App;