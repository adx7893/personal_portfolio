import React from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Lock,
  Radio,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { handleInternalNav } from '../utils/navigation';

const SERVICE_CARDS = [
  {
    id: 'resume-analyzer',
    title: 'Resume Analyzer',
    description: 'Upload your resume and get ATS-style scoring, skill gaps, and actionable rewrite tips.',
    href: '/resume-analyzer',
    icon: FileText,
  },
  {
    id: 'job-tracker',
    title: 'Job Tracker',
    description: 'Track applications, reminders, statuses, and cover-letter history in one workflow.',
    href: '/job-tracker',
    icon: BriefcaseBusiness,
  },
  {
    id: 'cover-letter-generator',
    title: 'Cover Letter',
    description: 'Generate role-specific cover letters from your resume and job descriptions.',
    href: '/cover-letter-generator',
    icon: ScrollText,
  },
  {
    id: 'live-jobs',
    title: 'Live Jobs',
    description: 'Search live listings with filters, save roles, and track applications in real time.',
    href: '/live-job-feed',
    icon: Radio,
  },
];

const ServicesLanding = () => {
  const { isAuthenticated, token, loading } = useAuth();
  const hasSession = Boolean(token);

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Services Hub
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
            All Career Services In One Place
          </h1>
          <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-300">
            Access resume intelligence, application tracking, cover-letter generation, and live job discovery.
            {(isAuthenticated || hasSession) ? ' You are authenticated and can access all services.' : ' Login is required before using any service tools.'}
          </p>
          {!hasSession && !loading && (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/login"
                onClick={handleInternalNav('/login')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono uppercase tracking-widest"
              >
                <Lock className="w-4 h-4" />
                Login To Continue
              </a>
              <a
                href="/signup"
                onClick={handleInternalNav('/signup')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-mono uppercase tracking-widest"
              >
                Create Account
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_CARDS.map((service) => {
            const Icon = service.icon;
            return (
              <a
                key={service.id}
                href={service.href}
                onClick={handleInternalNav(service.href)}
                className="group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{service.title}</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{service.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { ServicesLanding };
