import React, { useEffect, useState } from 'react';
import { Home, FileText, BriefcaseBusiness, ScrollText, Radio, Moon, Sun, Menu, X, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { handleInternalNav, navigateTo } from '../utils/navigation';

const Navbar = ({ theme, toggleTheme }) => {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = window.location.pathname;

  const isLanding = pathname === '/';
  const isResumeAnalyzer = pathname === '/resume-analyzer';
  const isJobTracker = pathname === '/job-tracker';
  const isCoverLetterGenerator = pathname === '/cover-letter-generator';
  const isLiveJobFeed = pathname === '/live-job-feed';
  const isProfile = pathname === '/profile';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, isAuthenticated]);

  const homeLink = (
    <a
      href="/"
      onClick={handleInternalNav('/')}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide transition-colors ${
        isLanding
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      <Home className="w-4 h-4" />
      <span>Home</span>
    </a>
  );

  const protectedLinks = (
    <>
      <a
        href="/resume-analyzer"
        onClick={handleInternalNav('/resume-analyzer')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide transition-colors ${
          isResumeAnalyzer
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span>Resume Analyzer</span>
      </a>

      <a
        href="/job-tracker"
        onClick={handleInternalNav('/job-tracker')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide transition-colors ${
          isJobTracker
            ? 'bg-emerald-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <BriefcaseBusiness className="w-4 h-4" />
        <span>Job Tracker</span>
      </a>

      <a
        href="/cover-letter-generator"
        onClick={handleInternalNav('/cover-letter-generator')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide transition-colors ${
          isCoverLetterGenerator
            ? 'bg-sky-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <ScrollText className="w-4 h-4" />
        <span>Cover Letter</span>
      </a>

      <a
        href="/live-job-feed"
        onClick={handleInternalNav('/live-job-feed')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide transition-colors ${
          isLiveJobFeed
            ? 'bg-orange-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <Radio className="w-4 h-4" />
        <span>Live Jobs</span>
      </a>

      <a
        href="/profile"
        onClick={handleInternalNav('/profile')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide transition-colors ${
          isProfile
            ? 'bg-violet-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <UserCircle2 className="w-4 h-4" />
        <span>Profile</span>
      </a>
    </>
  );

  const navLinks = isAuthenticated ? (
    <>
      {homeLink}
      {protectedLinks}
    </>
  ) : (
    <>{homeLink}</>
  );

  const authLinks = isAuthenticated ? (
    <button
      type="button"
      onClick={async () => {
        await logout();
        navigateTo('/login', { replace: true });
      }}
      className="px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide bg-red-600 text-white hover:bg-red-500 transition-colors"
    >
      Logout
    </button>
  ) : (
    <>
      <a
        href="/login"
        onClick={handleInternalNav('/login')}
        className="px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        Login
      </a>
      <a
        href="/signup"
        onClick={handleInternalNav('/signup')}
        className="px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wide bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
      >
        Signup
      </a>
    </>
  );

  return (
    <nav className="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-2 md:px-3 md:py-2">
        <div className="flex md:hidden items-center justify-between gap-2">
          {homeLink}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-2 grid grid-cols-2 gap-2">
            {navLinks}
            {authLinks}
          </div>
        )}

        <div className="hidden md:flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pr-1">
            {navLinks}
            {authLinks}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
