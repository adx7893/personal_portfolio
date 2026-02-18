import React, { useMemo, useState } from 'react';
import { Upload, FileText, Target, CheckCircle2, AlertCircle, BriefcaseBusiness, ExternalLink } from 'lucide-react';
import { analyzeResume } from '../services/resumeAnalyzerApi';

const ResultBlock = ({ title, items }) => (
  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
    <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">{title}</h3>
    {items.length === 0 ? (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">No major issues found.</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={`${title}-${idx}`} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ResumeAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const canSubmit = useMemo(
    () => resumeFile && jobDescription.trim().length >= 60 && !isLoading,
    [resumeFile, jobDescription, isLoading]
  );

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      const analysis = await analyzeResume({
        resumeFile,
        jobDescription: jobDescription.trim(),
      });
      setResult(analysis);
    } catch (err) {
      setError(err.message || 'Unable to analyze resume right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Resume Analyzer
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-2xl">
            Upload your resume, paste a job description, and get ATS-style analysis with match score, gaps, and improvement suggestions.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
              Resume (PDF)
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 cursor-pointer hover:border-indigo-500 transition-colors">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {resumeFile ? resumeFile.name : 'Click to upload resume PDF'}
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              required
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Minimum 60 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs uppercase tracking-widest transition-colors"
          >
            <Target className="w-4 h-4" />
            {isLoading ? 'Analyzing...' : 'Analyze Resume'}
          </button>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">Match Score</p>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-4xl font-bold text-zinc-900 dark:text-white">{result.match_score}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultBlock title="Strengths" items={result.strengths || []} />
              <ResultBlock title="Missing Skills" items={result.missing_skills || []} />
              <ResultBlock title="Keyword Gaps" items={result.keyword_gaps || []} />
              <ResultBlock title="ATS Issues" items={result.ats_issues || []} />
            </div>

            <ResultBlock title="Improved Bullet Rewrites" items={result.improved_bullets || []} />

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                <BriefcaseBusiness className="w-4 h-4" />
                Latest Open Positions (Market)
              </h3>
              {Array.isArray(result.latest_open_positions) && result.latest_open_positions.length > 0 ? (
                <div className="space-y-3">
                  {result.latest_open_positions.map((job) => (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{job.title}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                            {job.company_name} | {job.location}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                            Posted: {new Date(job.publication_date).toLocaleDateString()}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No relevant latest openings found at the moment.
                </p>
              )}
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Final Summary
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{result.summary || 'No summary available.'}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { ResumeAnalyzer };
