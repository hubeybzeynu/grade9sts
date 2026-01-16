import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ParticleBackground from '@/components/ParticleBackground';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import TextbooksPage from '@/components/TextbooksPage';
import StudentsPage from '@/components/StudentsPage';
import ResultsPage from '@/components/ResultsPage';
import ScreenLock from '@/components/ScreenLock';
import WelcomeOnboarding from '@/components/WelcomeOnboarding';

type PageType = 'home' | 'textbooks' | 'students' | 'results';

const STORAGE_KEY = 'portal_unlocked';
const ONBOARDING_KEY = 'portal_onboarding_complete';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'textbooks':
        return <TextbooksPage />;
      case 'students':
        return <StudentsPage />;
      case 'results':
        return <ResultsPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Show screen lock if not unlocked
  if (!isUnlocked) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        <ParticleBackground />
        <AnimatePresence>
          <ScreenLock onUnlock={handleUnlock} />
        </AnimatePresence>
      </div>
    );
  }

  // Show onboarding after unlock if not completed
  if (showOnboarding) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        <ParticleBackground />
        <AnimatePresence>
          <WelcomeOnboarding onComplete={handleOnboardingComplete} />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ParticleBackground />
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
