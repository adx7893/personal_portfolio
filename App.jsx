import React, { useEffect, useState } from 'react';
import { ChatWidget } from './components/ChatWidget';
import { NeuralBackground } from './components/NeuralBackground';
import { Navbar } from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { JobTracker } from './pages/JobTracker';
import { CoverLetterGenerator } from './pages/CoverLetterGenerator';
import { LiveJobFeed } from './pages/LiveJobFeed';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ServicesLanding } from './pages/ServicesLanding';
import { navigateTo } from './utils/navigation';

const THEME_KEY = 'theme';

const getInitialTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyTheme = (nextTheme) => {
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
};

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [pathname, setPathname] = useState(window.location.pathname);
  const isResumeAnalyzerPage = pathname === '/resume-analyzer';
  const isJobTrackerPage = pathname === '/job-tracker';
  const isCoverLetterGeneratorPage = pathname === '/cover-letter-generator';
  const isLiveJobFeedPage = pathname === '/live-job-feed';
  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname === '/signup';
  const isDashboardPage = pathname === '/dashboard';
  const isProfilePage = pathname === '/profile';
  const isProtectedServicePage =
    isResumeAnalyzerPage ||
    isJobTrackerPage ||
    isCoverLetterGeneratorPage ||
    isLiveJobFeedPage ||
    isDashboardPage ||
    isProfilePage;
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    window.addEventListener('app:navigate', syncPath);
    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('app:navigate', syncPath);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && (isLoginPage || isSignupPage)) {
      navigateTo('/', { replace: true });
      return;
    }
    if (!isAuthenticated && isProtectedServicePage) {
      const next = encodeURIComponent(pathname);
      navigateTo(`/login?next=${next}`, { replace: true });
    }
  }, [loading, isAuthenticated, isProtectedServicePage, pathname, isLoginPage, isSignupPage]);

  const renderProtected = (node) => {
    if (loading) {
      return (
        <section className="mt-24">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
        </section>
      );
    }
    if (!isAuthenticated) {
      return (
        <section className="mt-24">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Redirecting to login...</p>
        </section>
      );
    }
    return node;
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 lg:p-12 relative selection:bg-indigo-500/30 transition-colors duration-300 overflow-x-hidden">
      <NeuralBackground />
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {isResumeAnalyzerPage ? (
          renderProtected(<ResumeAnalyzer />)
        ) : isJobTrackerPage ? (
          renderProtected(<JobTracker />)
        ) : isCoverLetterGeneratorPage ? (
          renderProtected(<CoverLetterGenerator />)
        ) : isLiveJobFeedPage ? (
          renderProtected(<LiveJobFeed />)
        ) : isLoginPage ? (
          <Login />
        ) : isSignupPage ? (
          <Signup />
        ) : isDashboardPage ? (
          renderProtected(<Dashboard />)
        ) : isProfilePage ? (
          renderProtected(<Profile />)
        ) : (
          <ServicesLanding />
        )}
      </div>

      <ChatWidget />
    </div>
  );
}

export default App;
