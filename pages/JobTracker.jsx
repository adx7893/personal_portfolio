
import React, { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  FileText,
  Link as LinkIcon,
  LoaderCircle,
  MapPin,
  Plus,
  Sparkles,
  StickyNote,
  TrendingUp,
  Upload,
  XCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { COVER_LETTER_TONES, generateCoverLetterApi } from '../services/coverLetterApi';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  'Applied',
  'Interview Scheduled',
  'Interview Completed',
  'Offer',
  'Rejected',
  'Ghosted',
];

const EMPTY_FORM = {
  company: '',
  role: '',
  description: '',
  jobLink: '',
  location: '',
  salaryRange: '',
  dateApplied: '',
  resumeName: '',
  reminderDate: '',
  notes: '',
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString();
};

const getMonthKey = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
};

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const downloadAsPdf = (fileName, text) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const lines = doc.splitTextToSize(text, width);
  let y = 64;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);

  lines.forEach((line) => {
    if (y > doc.internal.pageSize.getHeight() - 64) {
      doc.addPage();
      y = 64;
    }
    doc.text(line, margin, y);
    y += 17;
  });

  doc.save(`${fileName}.pdf`);
};

const downloadAsDocx = async (fileName, text) => {
  const paragraphs = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 24 })],
          spacing: { after: 200 },
        })
    );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.docx`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const extractKeywordMatchPercent = (description, matchedSkills) => {
  const jdTokens = new Set(
    (description || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length >= 5)
  );

  if (!jdTokens.size) return 0;

  const skillTokens = new Set(
    (matchedSkills || [])
      .flatMap((skill) =>
        String(skill)
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((token) => token.length >= 3)
      )
  );

  if (!skillTokens.size) return 0;

  let hitCount = 0;
  jdTokens.forEach((token) => {
    if (skillTokens.has(token)) hitCount += 1;
  });

  return Math.min(100, Math.round((hitCount / jdTokens.size) * 100));
};

const defaultCoverLetterState = {
  text: '',
  tone: 'Professional',
  matchedSkills: [],
  suggestedImprovements: [],
  keywordMatchPercent: 0,
  versions: [],
  updatedAt: '',
};

const JobTracker = () => {
  const { user } = useAuth();
  const storageKey = `job-tracker:applications:v2:${user?.id || 'anonymous'}`;
  const [form, setForm] = useState(EMPTY_FORM);
  const [applications, setApplications] = useState([]);
  const [resumeTextByAppId, setResumeTextByAppId] = useState({});
  const [resumeFileByAppId, setResumeFileByAppId] = useState({});
  const [coverLetterUiState, setCoverLetterUiState] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setApplications([]);
      setCoverLetterUiState({});
      setResumeTextByAppId({});
      setResumeFileByAppId({});
      return;
    }

    const parsed = safeJsonParse(raw, []);
    if (!Array.isArray(parsed)) return;

    const normalized = parsed.map((item) => ({
      ...item,
      coverLetter: { ...defaultCoverLetterState, ...(item.coverLetter || {}) },
    }));
    setApplications(normalized);

    const initialUiState = normalized.reduce((acc, item) => {
      acc[item.id] = {
        tone: item.coverLetter?.tone || 'Professional',
        isLoading: false,
        error: '',
      };
      return acc;
    }, {});

    setCoverLetterUiState(initialUiState);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(applications));
  }, [applications, storageKey]);

  const analytics = useMemo(() => {
    const total = applications.length;
    const offers = applications.filter((item) => item.status === 'Offer').length;
    const rejected = applications.filter((item) => item.status === 'Rejected').length;
    const interviewStates = new Set(['Interview Scheduled', 'Interview Completed', 'Offer']);
    const interviews = applications.filter((item) => interviewStates.has(item.status)).length;

    const byStatus = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = applications.filter((item) => item.status === status).length;
      return acc;
    }, {});

    const byMonth = applications.reduce((acc, item) => {
      const key = getMonthKey(item.dateApplied);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const monthSeries = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        key,
        label: getMonthLabel(key),
        value,
      }));

    return {
      total,
      offers,
      rejected,
      interviews,
      interviewRate: total ? Math.round((interviews / total) * 100) : 0,
      offerRate: total ? Math.round((offers / total) * 100) : 0,
      rejectionRate: total ? Math.round((rejected / total) * 100) : 0,
      byStatus,
      monthSeries,
    };
  }, [applications]);

  const reminders = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const threeDays = new Date(now);
    threeDays.setDate(threeDays.getDate() + 3);

    return applications
      .filter((item) => item.reminderDate)
      .map((item) => ({
        ...item,
        reminderObj: new Date(item.reminderDate),
      }))
      .filter((item) => !Number.isNaN(item.reminderObj.getTime()))
      .sort((a, b) => a.reminderObj - b.reminderObj)
      .map((item) => {
        const reminder = new Date(item.reminderObj);
        reminder.setHours(0, 0, 0, 0);
        const isOverdue = reminder < now;
        const isSoon = reminder >= now && reminder <= threeDays;
        return { ...item, isOverdue, isSoon };
      })
      .filter((item) => item.isSoon || item.isOverdue);
  }, [applications]);
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;

    const item = {
      id: crypto.randomUUID(),
      company: form.company.trim(),
      role: form.role.trim(),
      description: form.description.trim(),
      jobLink: form.jobLink.trim(),
      location: form.location.trim(),
      salaryRange: form.salaryRange.trim(),
      dateApplied: form.dateApplied || new Date().toISOString().split('T')[0],
      resumeName: form.resumeName.trim(),
      reminderDate: form.reminderDate || '',
      notes: form.notes.trim(),
      status: 'Applied',
      coverLetter: defaultCoverLetterState,
      createdAt: new Date().toISOString(),
    };

    setApplications((prev) => [item, ...prev]);
    setCoverLetterUiState((prev) => ({
      ...prev,
      [item.id]: {
        tone: 'Professional',
        isLoading: false,
        error: '',
      },
    }));
    setForm(EMPTY_FORM);
  };

  const handleStatusChange = (id, nextStatus) => {
    setApplications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
  };

  const handleNotesChange = (id, nextNotes) => {
    setApplications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: nextNotes } : item))
    );
  };

  const handleReminderChange = (id, nextReminderDate) => {
    setApplications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reminderDate: nextReminderDate } : item))
    );
  };

  const handleCoverLetterEdit = (id, nextText) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              coverLetter: {
                ...item.coverLetter,
                text: nextText,
                updatedAt: new Date().toISOString(),
              },
            }
          : item
      )
    );
  };

  const setAppCoverLetterError = (appId, message) => {
    setCoverLetterUiState((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        error: message,
      },
    }));
  };

  const handleGenerateCoverLetter = async (application) => {
    const tone = coverLetterUiState[application.id]?.tone || 'Professional';
    const resumeText = resumeTextByAppId[application.id] || '';
    const resumeFile = resumeFileByAppId[application.id] || null;

    if (!application.description || application.description.length < 60) {
      setAppCoverLetterError(application.id, 'Job description is too short. Add at least 60 characters.');
      return;
    }

    if (!resumeText && !resumeFile) {
      setAppCoverLetterError(
        application.id,
        'Add resume text or upload resume PDF/DOCX before generating.'
      );
      return;
    }

    setCoverLetterUiState((prev) => ({
      ...prev,
      [application.id]: {
        ...prev[application.id],
        isLoading: true,
        error: '',
      },
    }));

    try {
      const payload = await generateCoverLetterApi({
        application,
        tone,
        resumeText,
        resumeFile,
      });

      setApplications((prev) =>
        prev.map((item) => {
          if (item.id !== application.id) return item;

          const previousVersions = Array.isArray(item.coverLetter?.versions)
            ? item.coverLetter.versions
            : [];

          const nextVersion = {
            id: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
            tone,
            text: payload.coverLetter,
            matchedSkills: payload.matchedSkills || [],
            suggestedImprovements: payload.suggestedImprovements || [],
          };

          return {
            ...item,
            coverLetter: {
              text: payload.coverLetter,
              tone,
              matchedSkills: payload.matchedSkills || [],
              suggestedImprovements: payload.suggestedImprovements || [],
              keywordMatchPercent: extractKeywordMatchPercent(
                item.description,
                payload.matchedSkills || []
              ),
              versions: [nextVersion, ...previousVersions].slice(0, 5),
              updatedAt: new Date().toISOString(),
            },
          };
        })
      );
    } catch (error) {
      setAppCoverLetterError(application.id, error.message || 'Failed to generate cover letter.');
    } finally {
      setCoverLetterUiState((prev) => ({
        ...prev,
        [application.id]: {
          ...prev[application.id],
          isLoading: false,
        },
      }));
    }
  };

  const maxMonthly = analytics.monthSeries.reduce((max, item) => Math.max(max, item.value), 1);

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Job Application Tracker
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-3xl">
            Manage applications, track interview progress, capture notes, and generate AI cover letters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total Applications</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{analytics.total}</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Interview Rate</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{analytics.interviewRate}%</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Offer Rate</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{analytics.offerRate}%</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Rejection Rate</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{analytics.rejectionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4"
          >
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Job Application
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company name"
                required
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                value={form.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Job title"
                required
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                value={form.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Location"
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                value={form.salaryRange}
                onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                placeholder="Salary range (optional)"
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => handleInputChange('dateApplied', e.target.value)}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                type="date"
                value={form.reminderDate}
                onChange={(e) => handleInputChange('reminderDate', e.target.value)}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                value={form.jobLink}
                onChange={(e) => handleInputChange('jobLink', e.target.value)}
                placeholder="Job link"
                className="md:col-span-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <input
                value={form.resumeName}
                onChange={(e) => handleInputChange('resumeName', e.target.value)}
                placeholder="Resume file name used"
                className="md:col-span-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <textarea
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Job description"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />

            <textarea
              value={form.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Recruiter notes, interview notes, feedback, follow-up comments"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase tracking-widest transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Save Application
            </button>
          </form>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              Reminder Center
            </h2>
            <div className="mt-4 space-y-3">
              {reminders.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No reminders due in the next 3 days.
                </p>
              ) : (
                reminders.map((item) => (
                  <div
                    key={`reminder-${item.id}`}
                    className={`rounded-xl border p-3 ${
                      item.isOverdue
                        ? 'border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30'
                        : 'border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30'
                    }`}
                  >
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.company} | {item.role}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      {item.isOverdue ? 'Overdue follow-up' : 'Upcoming follow-up'} on {formatDate(item.reminderDate)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Status Breakdown
            </h2>
            <div className="mt-4 space-y-3">
              {STATUS_OPTIONS.map((status) => {
                const count = analytics.byStatus[status] || 0;
                const widthPercent = analytics.total ? Math.round((count / analytics.total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
                      <span>{status}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800/80 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${widthPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              Monthly Applications
            </h2>
            <div className="mt-4">
              {analytics.monthSeries.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No monthly data yet.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.monthSeries.map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.round((item.value / maxMonthly) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4" />
            Applications
          </h2>

          <div className="mt-4 space-y-4">
            {applications.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No applications added yet.</p>
            ) : (
              applications.map((item) => {
                const ui = coverLetterUiState[item.id] || {
                  tone: 'Professional',
                  isLoading: false,
                  error: '',
                };

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/30 p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          {item.company} | {item.role}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.location || 'Location not set'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5" />
                            Applied {formatDate(item.dateApplied)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {item.resumeName || 'Resume not specified'}
                          </span>
                          {item.salaryRange && (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {item.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>

                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="w-full lg:w-auto rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {item.description && (
                      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{item.description}</p>
                    )}

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="text-xs text-zinc-600 dark:text-zinc-300">
                        <span className="inline-flex items-center gap-1 mb-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          Reminder Date
                        </span>
                        <input
                          type="date"
                          value={item.reminderDate || ''}
                          onChange={(e) => handleReminderChange(item.id, e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                        />
                      </label>

                      {item.jobLink ? (
                        <a
                          href={item.jobLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Open job posting
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <XCircle className="w-4 h-4" />
                          No job link saved
                        </span>
                      )}
                    </div>
                    <label className="block mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1 mb-1">
                        <StickyNote className="w-3.5 h-3.5" />
                        Notes
                      </span>
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                      />
                    </label>

                    <div className="mt-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                        <h4 className="text-sm font-mono uppercase tracking-widest text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          AI Cover Letter
                        </h4>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={ui.tone}
                            onChange={(e) =>
                              setCoverLetterUiState((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  tone: e.target.value,
                                  error: '',
                                },
                              }))
                            }
                            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                          >
                            {COVER_LETTER_TONES.map((toneOption) => (
                              <option key={toneOption} value={toneOption}>
                                {toneOption}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleGenerateCoverLetter(item)}
                            disabled={ui.isLoading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-mono uppercase tracking-wider w-full sm:w-auto"
                          >
                            {ui.isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {item.coverLetter?.text ? 'Regenerate' : 'Generate AI Cover Letter'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="text-xs text-zinc-600 dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1 mb-1">
                            <FileText className="w-3.5 h-3.5" />
                            Resume text (optional)
                          </span>
                          <textarea
                            value={resumeTextByAppId[item.id] || ''}
                            onChange={(e) =>
                              setResumeTextByAppId((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            rows={3}
                            placeholder="Paste extracted resume text if you do not want to upload a file"
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                          />
                        </label>

                        <label className="text-xs text-zinc-600 dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1 mb-1">
                            <Upload className="w-3.5 h-3.5" />
                            Upload resume (PDF/DOCX)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setResumeFileByAppId((prev) => ({ ...prev, [item.id]: file }));
                            }}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                          />
                          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {resumeFileByAppId[item.id]?.name || 'No resume file selected'}
                          </p>
                        </label>
                      </div>

                      {ui.error && (
                        <p className="text-xs text-red-600 dark:text-red-400">{ui.error}</p>
                      )}

                      {item.coverLetter?.text ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              Tone: <span className="font-semibold">{item.coverLetter.tone || 'Professional'}</span>
                            </div>
                            <div className="rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              Keyword Match: <span className="font-semibold">{item.coverLetter.keywordMatchPercent || 0}%</span>
                            </div>
                            <div className="rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              Versions Saved: <span className="font-semibold">{item.coverLetter.versions?.length || 0}</span>
                            </div>
                          </div>

                          <textarea
                            value={item.coverLetter.text}
                            onChange={(e) => handleCoverLetterEdit(item.id, e.target.value)}
                            rows={14}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-sm leading-relaxed"
                          />

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(item.coverLetter.text)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-mono uppercase tracking-wider"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadAsPdf(`${item.company}-${item.role}-cover-letter`, item.coverLetter.text)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-wider"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadAsDocx(`${item.company}-${item.role}-cover-letter`, item.coverLetter.text)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono uppercase tracking-wider"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download DOCX
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Matched Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {(item.coverLetter.matchedSkills || []).length === 0 ? (
                                  <span className="text-zinc-500 dark:text-zinc-400">No matched skills returned.</span>
                                ) : (
                                  item.coverLetter.matchedSkills.map((skill) => (
                                    <span
                                      key={`${item.id}-skill-${skill}`}
                                      className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    >
                                      {skill}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Suggested Improvements</p>
                              <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
                                {(item.coverLetter.suggestedImprovements || []).length === 0 ? (
                                  <li className="text-zinc-500 dark:text-zinc-400">No suggestions returned.</li>
                                ) : (
                                  item.coverLetter.suggestedImprovements.map((tip) => (
                                    <li key={`${item.id}-tip-${tip}`}>- {tip}</li>
                                  ))
                                )}
                              </ul>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          No cover letter generated yet.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { JobTracker };
