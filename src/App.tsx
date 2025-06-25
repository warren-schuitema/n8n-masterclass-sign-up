// Main App component - streamlined registration flow for masterclass
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Instructor } from './components/Instructor';
import { ThankYou } from './components/ThankYou';
import { Footer } from './components/Footer';
import { Registration } from './components/Registration';

export type PageState = 'landing' | 'thank-you' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');

    // Check for successful purchase redirect and show thank you page
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    
    if (isSuccess) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show thank you page
      setCurrentPage('thank-you');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleRegistrationClick = () => {
    setCurrentPage('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleRegistrationComplete = () => {
    setCurrentPage('thank-you');
  };

  if (currentPage === 'dashboard') {
    return (
      <Registration 
        onComplete={handleRegistrationComplete}
        onBack={handleBackToLanding}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  if (currentPage === 'thank-you') {
    return (
      <ThankYou 
        onBackToLanding={handleBackToLanding}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        onRegisterClick={handleRegistrationClick}
      />
      <Hero onRegisterClick={handleRegistrationClick} />
      <Instructor />
      <Footer />
    </div>
  );
}

export default App;