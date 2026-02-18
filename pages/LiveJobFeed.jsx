import React, { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ExternalLink,
  Filter,
  LoaderCircle,
  MapPin,
  Save,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  applyToJob,
  fetchJobs,
  saveJob,
} from '../services/jobsApi';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from '../utils/navigation';

const PAGE_SIZE = 12;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString();
};

const isNewJob = (publishedAt) => {
  const date = new Date(publishedAt).getTime();
  if (!Number.isFinite(date)) return false;
  const ageDays = (Date.now() - date) / (1000 * 60 * 60 * 24);
  return ageDays <= 3;
};

const LiveJobFeed = () => {
  const { token, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, lastSyncAt: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeSnippet, setResumeSnippet] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    location: '',
    remoteOnly: true,
    category: '',
    salaryMin: '',
    salaryMax: '',
    datePosted: '7',
    page: 1,
    limit: PAGE_SIZE,
  });

  const categories = useMemo(() => {
    const set = new Set(jobs.map((job) => job.category).filter(Boolean));
    return [...set].slice(0, 50);
  }, [jobs]);

  const loadJobs = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await fetchJobs(filters);
      setJobs(result.data || []);
      setMeta(result.meta || {});
    } catch (loadError) {
      setError(loadError.message || 'Unable to load jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters.page]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadJobs();
  };

  const handleSaveJob = async (jobId) => {
    try {
      await saveJob({ token, jobId });
      setActionMessage('Job saved successfully.');
    } catch (actionError) {
      setActionMessage(actionError.message || 'Unable to save job.');
    }
  };

  const handleApplyJob = async (jobId, applyUrl) => {
    try {
      const result = await applyToJob({ token, jobId });
      window.open(result.redirectUrl || applyUrl, '_blank', 'noopener,noreferrer');
      setActionMessage('Application tracked.');
    } catch (actionError) {
      setActionMessage(actionError.message || 'Unable to apply right now.');
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Live Job Feed
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-3xl">
              Real-time job aggregation with search, filters, save/apply tracking, and match-ready feed.
            </p>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-widest">
            Last Sync: {meta?.lastSyncAt ? formatDate(meta.lastSyncAt) : 'Pending'}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              value={filters.q}
              onChange={(e) => updateFilter('q', e.target.value)}
              placeholder="Search role/company"
              className="lg:col-span-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
            />
            <input
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
            />
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => updateFilter('salaryMin', e.target.value)}
              placeholder="Min salary"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={filters.salaryMax}
              onChange={(e) => updateFilter('salaryMax', e.target.value)}
              placeholder="Max salary"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
            />
            <select
              value={filters.datePosted}
              onChange={(e) => updateFilter('datePosted', e.target.value)}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
            >
              <option value="1">Past 24h</option>
              <option value="3">Past 3 days</option>
              <option value="7">Past 7 days</option>
              <option value="14">Past 14 days</option>
              <option value="30">Past 30 days</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={filters.remoteOnly}
                onChange={(e) => updateFilter('remoteOnly', e.target.checked)}
              />
              Remote only
            </label>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono uppercase tracking-wider"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Account
            </h2>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigateTo('/login', { replace: true });
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Logout
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Authenticated for save/apply actions.
          </p>
          {actionMessage && <p className="text-xs text-emerald-600 dark:text-emerald-400">{actionMessage}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-20 flex justify-center">
              <LoaderCircle className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="col-span-full text-sm text-zinc-500 dark:text-zinc-400">No jobs found for the selected filters.</p>
          ) : (
            jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{job.company}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {isNewJob(job.publishedAt) && (
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase">
                        New
                      </span>
                    )}
                    {job.highMatch && (
                      <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono uppercase inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        High Match
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-mono uppercase">
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  <p className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </p>
                  <p>{job.salaryText || 'Salary not listed'}</p>
                  <p>Posted: {formatDate(job.publishedAt)}</p>
                  <p>Category: {job.category || 'General'}</p>
                </div>

                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1">
                  {job.descriptionPreview}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyJob(job.id, job.applyUrl)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono uppercase tracking-wider"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Apply Now
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveJob(job.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-mono uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Job
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-widest">
            {meta.total || 0} jobs
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={(meta.page || 1) <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase tracking-wider disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">
              Page {meta.page || 1} of {meta.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={(meta.page || 1) >= (meta.totalPages || 1)}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-mono uppercase tracking-wider disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-2">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4" />
            Optional AI Matching Input
          </h3>
          <textarea
            value={resumeSnippet}
            onChange={(e) => setResumeSnippet(e.target.value)}
            rows={4}
            placeholder="Paste resume text to use with /api/ai/match-job endpoint."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-3 py-2 text-sm"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This page includes backend support for `POST /api/ai/match-job` and high-match tagging from aggregation heuristics.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </section>
  );
};

export { LiveJobFeed };
