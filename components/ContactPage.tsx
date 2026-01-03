import React from 'react';
import Layout from './Layout';
import Navbar from './Navbar';
import Contact from './Contact';
import Footer from './Footer';
import Reveal from './Reveal';

const ContactPage: React.FC = () => {
  // We need to manage theme state if we use Navbar here, 
  // but since App handles it, let's assume global document class is enough.
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
  
  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <Layout>
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        openSearch={() => { window.location.hash = ''; }} // Simple redirect to home
        openTerminal={() => { window.location.hash = ''; }} 
      />
      <div className="pt-32 md:pt-40">
        <section className="container mx-auto px-6 mb-20 text-center">
          <Reveal variant="skew-up">
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white tracking-ultra leading-none mb-6">
              Get in Touch.
            </h1>
            <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Whether you have a question, a project proposal, or just want to say hi, my inbox is always open.
            </p>
          </Reveal>
        </section>

        <Contact />
      </div>
      <Footer />
    </Layout>
  );
};

export default ContactPage;