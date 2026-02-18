import crypto from 'crypto';
import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';
import { sanitizeInput } from '../utils/text.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getJobById,
  getJobSyncMeta,
  listJobs,
  runJobAggregation,
} from '../services/jobAggregationService.js';
import { computeJobMatch } from '../services/jobMatchingService.js';
import { readTable, upsertTable } from '../services/fileDbService.js';

const router = express.Router();

router.use(requireAuth);

const parseBoolean = (value) => String(value || '').toLowerCase() === 'true';

const paginate = (rows, page, limit) => {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * limit;
  return {
    items: rows.slice(offset, offset + limit),
    page: safePage,
    limit,
    total,
    totalPages,
  };
};

router.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));

    const q = sanitizeInput(req.query.q, 120).toLowerCase();
    const location = sanitizeInput(req.query.location, 120).toLowerCase();
    const remoteOnly = parseBoolean(req.query.remoteOnly);
    const category = sanitizeInput(req.query.category, 120).toLowerCase();
    const salaryMin = Number(req.query.salaryMin || 0);
    const salaryMax = Number(req.query.salaryMax || 0);
    const datePostedDays = Number(req.query.datePosted || 0);

    const jobs = await listJobs();
    const now = Date.now();

    let filtered = jobs.filter((job) => {
      if (q) {
        const haystack = `${job.title} ${job.company} ${job.descriptionPreview} ${job.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (location && !String(job.location || '').toLowerCase().includes(location)) return false;
      if (remoteOnly && !job.isRemote) return false;
      if (category && !String(job.category || '').toLowerCase().includes(category)) return false;
      if (salaryMin > 0 && Number(job.salaryMax || 0) < salaryMin) return false;
      if (salaryMax > 0 && Number(job.salaryMin || 0) > salaryMax) return false;

      if (datePostedDays > 0) {
        const publishedMs = new Date(job.publishedAt).getTime();
        if (!Number.isFinite(publishedMs)) return false;
        const ageDays = (now - publishedMs) / (1000 * 60 * 60 * 24);
        if (ageDays > datePostedDays) return false;
      }

      return true;
    });

    filtered = filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const paged = paginate(filtered, page, limit);

    res.status(200).json({
      success: true,
      data: paged.items,
      meta: {
        page: paged.page,
        limit: paged.limit,
        total: paged.total,
        totalPages: paged.totalPages,
        ...getJobSyncMeta(),
      },
    });
  })
);

router.get(
  '/jobs/:id([0-9a-fA-F-]{36})',
  asyncHandler(async (req, res) => {
    const job = await getJobById(req.params.id);
    if (!job) throw new ApiError(404, 'Job not found.');
    res.status(200).json({ success: true, data: job });
  })
);

router.post(
  '/jobs/save',
  asyncHandler(async (req, res) => {
    const jobId = sanitizeInput(req.body?.jobId, 80);
    if (!jobId) throw new ApiError(400, 'jobId is required.');

    const job = await getJobById(jobId);
    if (!job) throw new ApiError(404, 'Job not found.');

    let savedRecord;
    await upsertTable('savedJobs', async (savedJobs) => {
      const existing = savedJobs.find((entry) => entry.userId === req.user.id && entry.jobId === jobId);
      if (existing) {
        savedRecord = existing;
        return savedJobs;
      }

      savedRecord = {
        id: crypto.randomUUID(),
        userId: req.user.id,
        jobId,
        createdAt: new Date().toISOString(),
      };
      return [savedRecord, ...savedJobs];
    });

    res.status(200).json({ success: true, data: savedRecord });
  })
);

router.post(
  '/jobs/apply',
  asyncHandler(async (req, res) => {
    const jobId = sanitizeInput(req.body?.jobId, 80);
    if (!jobId) throw new ApiError(400, 'jobId is required.');

    const job = await getJobById(jobId);
    if (!job) throw new ApiError(404, 'Job not found.');

    let applicationRecord;
    await upsertTable('applications', async (applications) => {
      const existing = applications.find((entry) => entry.userId === req.user.id && entry.jobId === jobId);
      if (existing) {
        applicationRecord = existing;
        return applications;
      }

      applicationRecord = {
        id: crypto.randomUUID(),
        userId: req.user.id,
        jobId,
        status: 'Applied',
        applyUrl: job.applyUrl,
        createdAt: new Date().toISOString(),
      };
      return [applicationRecord, ...applications];
    });

    res.status(200).json({
      success: true,
      data: {
        application: applicationRecord,
        redirectUrl: job.applyUrl,
      },
    });
  })
);

router.get(
  '/jobs/saved/list',
  asyncHandler(async (req, res) => {
    const [savedJobs, jobs] = await Promise.all([readTable('savedJobs'), listJobs()]);
    const userSaved = savedJobs
      .filter((entry) => entry.userId === req.user.id)
      .map((entry) => ({ ...entry, job: jobs.find((job) => job.id === entry.jobId) || null }));
    res.status(200).json({ success: true, data: userSaved });
  })
);

router.post(
  '/ai/match-job',
  asyncHandler(async (req, res) => {
    const jobId = sanitizeInput(req.body?.jobId, 80);
    const resumeText = sanitizeInput(req.body?.resumeText, 40_000);
    if (!jobId || !resumeText) {
      throw new ApiError(400, 'jobId and resumeText are required.');
    }

    const job = await getJobById(jobId);
    if (!job) throw new ApiError(404, 'Job not found.');

    const match = computeJobMatch({
      resumeText,
      jobDescription: `${job.description} ${job.tags?.join(' ') || ''}`,
    });

    res.status(200).json({ success: true, data: match });
  })
);

router.post(
  '/jobs/sync',
  asyncHandler(async (req, res) => {
    const result = await runJobAggregation();
    res.status(200).json({ success: true, data: result });
  })
);

export { router as jobRoutes };

