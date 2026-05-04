import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import WelcomeOnboarding from '@/components/WelcomeOnboarding';
import LoginGate from '@/components/LoginGate';
import Navbar from '@/components/Navbar';
import HomePage from '@/components/HomePage';
import TextbooksPage from '@/components/TextbooksPage';
import StudentsPage from '@/components/StudentsPage';
import ResultsPage from '@/components/ResultsPage';
import ExamResultPage from '@/components/ExamResultPage';
import ReportCardPage from '@/components/ReportCardPage';
import InfoPage from '@/components/InfoPage';
import ToolsFab from '@/components/ToolsFab';
import { supabase } from '@/integrations/supabase/client';
import { cloudSupabase } from '@/integrations/supabase/cloudClient';
import { botDeepLink, getBotUsername, getDeviceLinkId } from '@/lib/telegramBot';
import type { Session } from '@supabase/supabase-js';

const Index = () => {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splash_shown') === 'true',
  );
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('portal_onboarded') === 'true',
  );
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [pageHistory, setPageHistory] = useState<string[]>(['home']);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const navigateTo = useCallback((page: string) => {
    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (pageHistory.length > 1) {
        const newHistory = [...pageHistory];
        newHistory.pop();
        setPageHistory(newHistory);
        setCurrentPage(newHistory[newHistory.length - 1]);
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pageHistory]);

  useEffect(() => {
    if (pageHistory.length > 1) {
      window.history.pushState(null, '', window.location.href);
    }
  }, [currentPage, pageHistory.length]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash_shown', 'true');
    setSplashDone(true);
  };

  // "Get Started" — register pending Telegram link tied to the Google account,
  // then open the bot deep link directly (no extra prompt screen).
  const handleOnboardComplete = useCallback(async () => {
    try {
      const deviceId = getDeviceLinkId();
      const userEmail = session?.user?.email || '';
      const meta = (session?.user?.user_metadata || {}) as Record<string, unknown>;
      const userName =
        (meta.full_name as string) ||
        (meta.name as string) ||
        userEmail.split('@')[0] ||
        'Visitor';

      // Register the pending link + notify admin (best-effort).
      await cloudSupabase.functions.invoke('telegram-link', {
        body: { device_link_id: deviceId, user_email: userEmail, user_name: userName },
      }).catch((e) => console.warn('telegram-link failed', e));

      // Resolve bot username and open the deep link directly.
      const username = await getBotUsername();
      const url = botDeepLink(username, deviceId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Get Started flow error', e);
    } finally {
      localStorage.setItem('portal_onboarded', 'true');
      setOnboarded(true);
    }
  }, [session]);

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // STEP 1: Google login first.
  if (authReady && !session) {
    return <LoginGate onLogin={() => { /* session arrives via listener */ }} />;
  }

  // STEP 2: Welcome onboarding (after login).
  if (session && !onboarded) {
    return (
      <AnimatePresence>
        <WelcomeOnboarding onComplete={handleOnboardComplete} />
      </AnimatePresence>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'textbooks':
        return <TextbooksPage />;
      case 'students':
        return <StudentsPage onNavigate={navigateTo} />;
      case 'results':
        return <ResultsPage />;
      case 'mid':
        return <ExamResultPage type="mid" />;
      case 'final':
        return <ExamResultPage type="final" />;
      case 'report':
        return <ReportCardPage />;
      case 'info':
        return <InfoPage onBack={() => navigateTo('home')} user={null} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />
      <ToolsFab />
      <div key={currentPage}>{renderPage()}</div>
    </div>
  );
};

export default Index;
