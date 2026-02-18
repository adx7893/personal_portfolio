import crypto from 'crypto';
import cron from 'node-cron';
import { readTable, writeTable } from './fileDbService.js';
import { normalizeText, sanitizeInput } from '../utils/text.js';

const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs';

let schedulerStarted = false;
let inMemoryJobs = [];
let cacheLoaded = false;
let lastSyncAt = null;
let syncInProgress = false;

const parseSalary = (salaryText) => {
  const safe = normalizeText(salaryText || '');
  if (!safe) return { salaryText: '', salaryMin: null, salaryMax: null };

  const numbers = safe.match(/\d[\d,]*/g)?.map((token) => Number(token.replace(/,/g, ''))) || [];
  const salaryMin = numbers.length ? Math.min(...numbers) : null;
  const salaryMax = numbers.length > 1 ? Math.max(...numbers) : salaryMin;

  return {
    salaryText: safe.slice(0, 120),
    salaryMin: Number.isFinite(salaryMin) ? salaryMin : null,
    salaryMax: Number.isFinite(salaryMax) ? salaryMax : null,
  };
};

const stripHtml = (html) =>
  sanitizeInput(String(html || '').replace(/<[^>]+>/g, ' '), 6000);

const computeHighMatch = (job) => {
  const keywords = ['react', 'node', 'javascript', 'typescript', 'frontend', 'backend', 'full stack'];
  const haystack = `${job.title} ${job.category} ${job.descriptionPreview}`.toLowerCase();
  const matches = keywords.filter((keyword) => haystack.includes(keyword));
  return { score: Math.min(100, matches.length * 20), highMatch: matches.length >= 3 };
};

const normalizeRemotiveJob = (job) => {
  const title = sanitizeInput(job?.title, 220);
  const company = sanitizeInput(job?.company_name, 160);
  const location = sanitizeInput(job?.candidate_required_location || 'Remote', 120);
  const description = stripHtml(job?.description || '');
  const descriptionPreview = description.slice(0, 220);
  const category = sanitizeInput(job?.category || 'General', 120);
  const applyUrl = sanitizeInput(job?.url, 500);
  const publishedAt = job?.publication_date || new Date().toISOString();
  const tags = Array.isArray(job?.tags)
    ? job.tags.map((tag) => sanitizeInput(tag, 60)).filter(Boolean).slice(0, 12)
    : [];
  const { salaryText, salaryMin, salaryMax } = parseSalary(job?.salary);
  const { score, highMatch } = computeHighMatch({ title, category, descriptionPreview });

  return {
    id: crypto.randomUUID(),
    source: 'remotive',
    sourceId: String(job?.id || ''),
    title,
    company,
    location,
    isRemote: true,
    category,
    salaryText,
    salaryMin,
    salaryMax,
    descriptionPreview,
    description,
    applyUrl,
    tags,
    publishedAt,
    matchScore: score,
    highMatch,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const dedupeJobs = (jobs) => {
  const unique = new Map();
  for (const job of jobs) {
    const key = `${job.source}:${job.sourceId || ''}:${job.applyUrl || ''}:${job.company}:${job.title}`.toLowerCase();
    if (!unique.has(key)) unique.set(key, job);
  }
  return [...unique.values()];
};

const fetchRemotiveJobs = async () => {
  const response = await fetch(REMOTIVE_API_URL);
  if (!response.ok) {
    throw new Error(`Remotive API returned status ${response.status}`);
  }

  const payload = await response.json();
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  return jobs.map(normalizeRemotiveJob).filter((job) => job.title && job.company && job.applyUrl);
};

const mergeJobs = (existingJobs, incomingJobs) => {
  const byKey = new Map();
  for (const job of existingJobs) {
    const key = `${job.source}:${job.sourceId || ''}:${job.applyUrl || ''}:${job.company}:${job.title}`.toLowerCase();
    byKey.set(key, job);
  }

  for (const job of incomingJobs) {
    const key = `${job.source}:${job.sourceId || ''}:${job.applyUrl || ''}:${job.company}:${job.title}`.toLowerCase();
    const previous = byKey.get(key);
    if (!previous) {
      byKey.set(key, job);
      continue;
    }

    byKey.set(key, {
      ...previous,
      ...job,
      id: previous.id,
      createdAt: previous.createdAt || job.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  return dedupeJobs([...byKey.values()])
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 2500);
};

const loadJobsFromDisk = async () => {
  if (cacheLoaded) return inMemoryJobs;
  inMemoryJobs = await readTable('jobs');
  cacheLoaded = true;
  return inMemoryJobs;
};

export const runJobAggregation = async () => {
  if (syncInProgress) return { synced: false, reason: 'sync_in_progress' };
  syncInProgress = true;

  try {
    const [existing, incoming] = await Promise.all([loadJobsFromDisk(), fetchRemotiveJobs()]);
    inMemoryJobs = mergeJobs(existing, incoming);
    await writeTable('jobs', inMemoryJobs);
    lastSyncAt = new Date().toISOString();
    return { synced: true, count: inMemoryJobs.length, lastSyncAt };
  } catch (error) {
    return { synced: false, reason: error.message || 'aggregation_failed' };
  } finally {
    syncInProgress = false;
  }
};

export const startJobAggregationScheduler = () => {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // Initial warm-up fetch on startup.
  runJobAggregation().catch(() => {});
  // Every 10 minutes.
  cron.schedule('*/10 * * * *', () => {
    runJobAggregation().catch(() => {});
  });
};

export const listJobs = async () => {
  await loadJobsFromDisk();
  return inMemoryJobs;
};

export const getJobById = async (jobId) => {
  const jobs = await listJobs();
  return jobs.find((job) => job.id === jobId) || null;
};

export const getJobSyncMeta = () => ({
  lastSyncAt,
  syncInProgress,
  cachedJobs: inMemoryJobs.length,
});
