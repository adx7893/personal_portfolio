import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { createRateLimitMiddleware } from '../config/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';
import { sanitizeInput } from '../utils/text.js';
import { extractTextFromResumeUpload } from '../services/documentService.js';
import { ALLOWED_TONES, generateCoverLetter, validateTone } from '../services/coverLetterService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = (file?.mimetype || '').toLowerCase();
    const name = (file?.originalname || '').toLowerCase();
    const isPdf = mime === 'application/pdf' || name.endsWith('.pdf');
    const isDocx =
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx');

    if (!isPdf && !isDocx) {
      return cb(new ApiError(400, 'Only PDF and DOCX resumes are supported.'));
    }

    return cb(null, true);
  },
});

const generationRateLimiter = createRateLimitMiddleware({
  keyPrefix: 'cover-letter',
  windowMs: env.COVER_LETTER_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.COVER_LETTER_RATE_LIMIT_MAX_REQUESTS,
});

router.post(
  '/ai/generate-cover-letter',
  requireAuth,
  generationRateLimiter,
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    const applicationId = sanitizeInput(req.body?.applicationId, 200);
    if (!applicationId) {
      throw new ApiError(400, 'applicationId is required.');
    }

    let application = {};
    if (typeof req.body?.application === 'string' && req.body.application.trim()) {
      try {
        application = JSON.parse(req.body.application);
      } catch {
        throw new ApiError(400, 'application must be valid JSON.');
      }
    }

    // Ensure client-provided application identity is consistent.
    if (String(application?.id || '') !== applicationId) {
      throw new ApiError(400, 'applicationId does not match provided application payload.');
    }

    const company = sanitizeInput(application?.company, 200);
    const role = sanitizeInput(application?.role, 200);
    const jobDescription = sanitizeInput(application?.description, 20_000);
    const tone = validateTone(sanitizeInput(req.body?.tone, 50));
    const inlineResumeText = sanitizeInput(req.body?.resumeText, 30_000);

    if (!company || !role) {
      throw new ApiError(400, 'Application company and role are required.');
    }

    if (!jobDescription || jobDescription.length < 60) {
      throw new ApiError(400, 'Job description must be at least 60 characters.');
    }

    let resumeText = inlineResumeText;
    if (!resumeText && req.file) {
      resumeText = await extractTextFromResumeUpload(req.file);
    }

    if (!resumeText || resumeText.length < 80) {
      throw new ApiError(
        400,
        'Resume text is required. Upload a PDF/DOCX resume or provide extracted resume text.'
      );
    }

    const result = await generateCoverLetter({
      company,
      role,
      jobDescription,
      resumeText,
      tone,
    });

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        applicationId,
        tone,
        allowedTones: ALLOWED_TONES,
      },
    });
  })
);

export { router as aiRoutes };

